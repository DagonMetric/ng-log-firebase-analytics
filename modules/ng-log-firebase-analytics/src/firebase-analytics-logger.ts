/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgZone } from '@angular/core';

import { EventInfo, EventTimingInfo, Logger, LogInfo, LogLevel, PageViewInfo, PageViewTimingInfo } from '@dagonmetric/ng-log';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { analytics } from 'firebase/app';

import { UserInfo } from './user-info';
import { runOutsideAngular } from './zone-helper';

/**
 * Firebase analytics implementation for `Logger`.
 */
export class FirebaseAnalyticsLogger extends Logger {
    private readonly _eventTiming: Map<string, number> = new Map<string, number>();

    constructor(
        readonly name: string,
        private readonly _zone: NgZone,
        private readonly _userInfo: UserInfo,
        private readonly _analytics$?: Observable<analytics.Analytics>) {
        super();
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        if (!this._analytics$ || logLevel === LogLevel.None) {
            return;
        }

        // tslint:disable-next-line: no-any
        const properties: { [key: string]: any } = logInfo && logInfo.properties ? { ...logInfo.properties } : {};

        if (logLevel === LogLevel.Error || logLevel === LogLevel.Critical) {
            properties.description = typeof message === 'string' ? message : `${message}`;
            properties.fatal = logLevel === LogLevel.Critical;

            this._analytics$.pipe(
                tap((analyticsService) => {
                    analyticsService.logEvent('exception', properties);
                }),
                runOutsideAngular(this._zone)
            ).subscribe();
        } else {
            let level: string;
            if (logLevel === LogLevel.Trace) {
                level = 'trace';
            } else if (logLevel === LogLevel.Debug) {
                level = 'debug';
            } else if (logLevel === LogLevel.Info) {
                level = 'info';
            } else {
                level = 'warn';
            }

            properties.message = typeof message === 'string' ? message : `${message}`;
            properties.level = level;

            this._analytics$.pipe(
                tap((analyticsService) => {
                    analyticsService.logEvent('trace', properties);
                }),
                runOutsideAngular(this._zone)
            ).subscribe();
        }
    }

    startTrackPage(name?: string): void {
        if (name == null) {
            name = window.document.title || '';
        }

        if (!name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        if (this._eventTiming.get(name) != null) {
            console.error(`The 'startTrackPage' was called more than once for this event without calling stop, name: ${name}.`);

            return;
        }

        this._eventTiming.set(name, +new Date());

        if (this._analytics$) {
            this._analytics$.pipe(
                runOutsideAngular(this._zone)
            ).subscribe();
        }
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        if (name == null) {
            name = window.document.title || '';
        }

        if (!name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        const start = this._eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackPage' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this._eventTiming.delete(name);

        if (!this._analytics$) {
            return;
        }

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedPageViewProps(pageViewInfo);
        properties.page_title = name;

        this._analytics$.pipe(
            tap((analyticsService) => {
                analyticsService.logEvent('timing_complete', {
                    ...properties,
                    name: 'page_view',
                    value: duration
                });
            }),
            runOutsideAngular(this._zone)
        ).subscribe();
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        if (!this._analytics$) {
            return;
        }

        if (!pageViewInfo) {
            this._analytics$.pipe(
                runOutsideAngular(this._zone)
            ).subscribe();
        } else {
            const properties = this.getMappedPageViewProps(pageViewInfo);
            if (pageViewInfo.name) {
                properties.page_title = pageViewInfo.name;
            }

            this._analytics$.pipe(
                tap((analyticsService) => {
                    // tslint:disable-next-line: no-any
                    analyticsService.logEvent('page_view' as any, properties);
                }),
                runOutsideAngular(this._zone)
            ).subscribe();
        }
    }

    startTrackEvent(name: string): void {
        if (this._eventTiming.get(name) != null) {
            console.error(`The 'startTrackEvent' was called more than once for this event without calling stop, name: ${name}.`);

            return;
        }

        this._eventTiming.set(name, +new Date());

        if (this._analytics$) {
            this._analytics$.pipe(
                runOutsideAngular(this._zone)
            ).subscribe();
        }
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        const start = this._eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackEvent' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this._eventTiming.delete(name);

        if (!this._analytics$) {
            return;
        }

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedEventProps(eventInfo);

        this._analytics$.pipe(
            tap((analyticsService) => {
                analyticsService.logEvent('timing_complete', {
                    ...properties,
                    name,
                    value: duration
                });
            }),
            runOutsideAngular(this._zone)
        ).subscribe();

    }

    trackEvent(eventInfo: EventInfo): void {
        if (!this._analytics$) {
            return;
        }

        const properties = this.getMappedEventProps(eventInfo);

        this._analytics$.pipe(
            tap((analyticsService) => {
                analyticsService.logEvent(eventInfo.name, eventInfo.properties || properties);
            }),
            runOutsideAngular(this._zone)
        ).subscribe();
    }

    flush(): void {
        // Do nothing
    }

    // tslint:disable-next-line: no-any
    private getMappedEventProps(eventInfo?: EventTimingInfo): { [key: string]: any } {
        if (!eventInfo) {
            return {};
        }

        // tslint:disable-next-line: no-any
        const mappedProps: { [key: string]: any } = {
            ...eventInfo.properties,
            ...eventInfo.measurements
        };

        if (this._userInfo.userId) {
            mappedProps.user_id = this._userInfo.userId;
        }

        if (this._userInfo.accountId) {
            mappedProps.account_id = this._userInfo.accountId;
        }

        return mappedProps;
    }

    // tslint:disable-next-line: no-any
    private getMappedPageViewProps(pageViewInfo?: PageViewTimingInfo): { [key: string]: any } {
        if (!pageViewInfo) {
            return {};
        }

        // tslint:disable-next-line: no-any
        const mappedProps: { [key: string]: any } = {
            ...pageViewInfo.properties,
            ...pageViewInfo.measurements
        };

        if (pageViewInfo.uri) {
            if (pageViewInfo.uri.startsWith('/')) {
                mappedProps.page_path = pageViewInfo.uri;
            } else {
                mappedProps.page_location = pageViewInfo.uri;
            }
        }

        if (pageViewInfo.ref_uri) {
            mappedProps.ref_uri = pageViewInfo.ref_uri;
        }

        if (pageViewInfo.page_type) {
            mappedProps.page_type = pageViewInfo.page_type;
        }

        if (pageViewInfo.is_logged_in != null) {
            mappedProps.is_logged_in = pageViewInfo.is_logged_in;
        }

        if (this._userInfo.userId) {
            mappedProps.user_id = this._userInfo.userId;
        }

        if (this._userInfo.accountId) {
            mappedProps.account_id = this._userInfo.accountId;
        }

        return mappedProps;
    }
}
