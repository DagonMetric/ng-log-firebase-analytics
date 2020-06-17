/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';

import { EMPTY, Observable, of } from 'rxjs';
import { map, observeOn, shareReplay, switchMap, tap } from 'rxjs/operators';

import {
    EventInfo,
    EventTimingInfo,
    LogInfo,
    LogLevel,
    Logger,
    LoggerProvider,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';

import { analytics } from 'firebase/app';

import { FirebaseAnalyticsLogger } from './firebase-analytics-logger';
import { FIREBASE_ANALYTICS_LOGGER_OPTIONS, FirebaseAnalyticsLoggerOptions } from './firebase-analytics-logger-options';
import { firebaseAppFactory } from './firebase-app-factory';
import { UserInfo } from './user-info';
import { ZoneScheduler } from './zone-helpers';

declare let Zone: { current: unknown };

const analyticsInstanceCache: { [key: string]: Observable<analytics.Analytics> } = {};

/**
 * Logger provider factory for `FirebaseAnalyticsLogger`.
 */
@Injectable({
    providedIn: 'any'
})
export class FirebaseAnalyticsLoggerProvider extends Logger implements LoggerProvider {
    private currentLoggerInternal?: FirebaseAnalyticsLogger;
    private readonly userInfo: UserInfo = {};
    private analytics$?: Observable<analytics.Analytics>;
    private firebaseAnalytics?: analytics.Analytics;

    private readonly isBrowser: boolean;

    get name(): string {
        return 'firebaseAnalytics';
    }

    get currentLogger(): FirebaseAnalyticsLogger {
        if (this.currentLoggerInternal) {
            return this.currentLoggerInternal;
        }

        this.currentLoggerInternal = new FirebaseAnalyticsLogger('', this.userInfo, this.firebaseAnalytics);

        return this.currentLoggerInternal;
    }

    constructor(
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) platformId: Object,
        private readonly ngZone: NgZone,
        @Inject(FIREBASE_ANALYTICS_LOGGER_OPTIONS) private readonly options: FirebaseAnalyticsLoggerOptions
    ) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);

        if (this.options.firebaseConfig.messagingSenderId) {
            const messagingSenderId = this.options.firebaseConfig.messagingSenderId;

            this.analytics$ = analyticsInstanceCache[messagingSenderId];
            if (!this.analytics$) {
                this.analytics$ = of(undefined).pipe(
                    observeOn(this.ngZone.runOutsideAngular(() => new ZoneScheduler(Zone.current))),
                    switchMap(() =>
                        this.isBrowser && typeof window !== 'undefined' && 'indexedDB' in window
                            ? import('firebase/analytics')
                            : EMPTY
                    ),
                    map(() => firebaseAppFactory(this.options.firebaseConfig, this.ngZone, this.options.appName)),
                    map((app) => app.analytics()),
                    tap((a) => {
                        if (this.options.analyticsCollectionEnabled === false) {
                            a.setAnalyticsCollectionEnabled(false);
                        }
                    }),
                    shareReplay({ bufferSize: 1, refCount: false })
                );

                analyticsInstanceCache[messagingSenderId] = this.analytics$;
            }
        }
    }

    ensureInitialized(): Observable<boolean> {
        if (!this.analytics$) {
            return of(false);
        }

        if (this.firebaseAnalytics != null) {
            return of(true);
        }

        return this.analytics$.pipe(
            tap((a) => {
                this.firebaseAnalytics = a;
            }),
            map(() => this.firebaseAnalytics != null)
        );
    }

    createLogger(category: string): Logger {
        return new FirebaseAnalyticsLogger(category, this.userInfo, this.firebaseAnalytics);
    }

    setUserProperties(userId: string, accountId?: string): void {
        this.userInfo.userId = userId;
        this.userInfo.accountId = accountId;
    }

    clearUserProperties(): void {
        this.userInfo.userId = undefined;
        this.userInfo.accountId = undefined;
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        this.currentLogger.log(logLevel, message, logInfo);
    }

    startTrackPage(name?: string): void {
        this.currentLogger.startTrackPage(name);
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        this.currentLogger.stopTrackPage(name, pageViewInfo);
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        this.currentLogger.trackPageView(pageViewInfo);
    }

    startTrackEvent(name: string): void {
        this.currentLogger.startTrackEvent(name);
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        this.currentLogger.stopTrackEvent(name, eventInfo);
    }

    trackEvent(eventInfo: EventInfo): void {
        this.currentLogger.trackEvent(eventInfo);
    }

    flush(): void {
        this.currentLogger.flush();
    }
}
