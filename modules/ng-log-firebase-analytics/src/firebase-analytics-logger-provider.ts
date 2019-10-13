/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';

import {
    EventInfo,
    EventTimingInfo,
    Logger,
    LoggerProvider,
    LogInfo,
    LogLevel,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';

import { analytics } from 'firebase/app';

import { FirebaseAnalyticsLogger } from './firebase-analytics-logger';
import { FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN, FirebaseAnalyticsLoggerOptions } from './firebase-analytics-logger-options';
import { firebaseAppFactory } from './firebase-app-factory';
import { UserInfo } from './user-info';

/**
 * Logger provider factory for `FirebaseAnalyticsLogger`.
 */
@Injectable({
    providedIn: 'root'
})
export class FirebaseAnalyticsLoggerProvider extends Logger implements LoggerProvider {
    private _currentLogger?: FirebaseAnalyticsLogger;
    private readonly _analytics?: analytics.Analytics;
    private readonly _userInfo: UserInfo = {};

    get name(): string {
        return 'firebaseAnalytics';
    }

    get currentLogger(): FirebaseAnalyticsLogger {
        if (this._currentLogger) {
            return this._currentLogger;
        }

        this._currentLogger = new FirebaseAnalyticsLogger(
            '',
            this._userInfo,
            this._analytics);

        return this._currentLogger;
    }

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private readonly _zone: NgZone,
        @Inject(FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN) options: FirebaseAnalyticsLoggerOptions) {
        super();
        const isBrowser = isPlatformBrowser(platformId);
        if (isBrowser && options.firebase && options.firebase.measurementId) {
            this._analytics = this._zone.runOutsideAngular(() => {
                const app = firebaseAppFactory(options);

                return app.analytics();
            });
        }
    }

    createLogger(category: string): Logger {
        return new FirebaseAnalyticsLogger(
            category,
            this._userInfo,
            this._analytics);
    }

    setUserProperties(userId: string, accountId?: string): void {
        this._userInfo.userId = userId;
        this._userInfo.accountId = accountId;

        // if (!this._analytics$) {
        //     return;
        // }

        // this._analytics$.pipe(
        //     tap((analyticsService) => {
        //         analyticsService.setUserId(userId);
        //         if (accountId) {
        //             analyticsService.setUserProperties({
        //                 account_id: accountId
        //             });
        //         }

        //     }),
        //     runOutsideAngular(this._zone)
        // ).subscribe();
    }

    clearUserProperties(): void {
        this._userInfo.userId = undefined;
        this._userInfo.accountId = undefined;

        // if (!this._analytics$) {
        //     return;
        // }

        // this._analytics$.pipe(
        //     tap((analyticsService) => {
        //         // tslint:disable-next-line: no-any
        //         analyticsService.setUserId(null as any);
        //     }),
        //     runOutsideAngular(this._zone)
        // ).subscribe();
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
