/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import {
    EventInfo,
    EventTimingInfo,
    LogInfo,
    LogLevel,
    Logger,
    PageViewInfo,
    PageViewTimingInfo
} from '@dagonmetric/ng-log';

import { analytics } from 'firebase/app';

import { UserInfo } from './user-info';

/**
 * Firebase analytics implementation for `Logger`.
 */
export class FirebaseAnalyticsLogger extends Logger {
    private readonly eventTiming: Map<string, number> = new Map<string, number>();

    constructor(
        readonly name: string,
        private readonly userInfo: UserInfo,
        private readonly firebaseAnalytics?: analytics.Analytics
    ) {
        super();
    }

    log(logLevel: LogLevel, message: string | Error, logInfo?: LogInfo): void {
        if (!this.firebaseAnalytics || logLevel === LogLevel.None) {
            return;
        }

        const properties: { [key: string]: unknown } = logInfo && logInfo.properties ? { ...logInfo.properties } : {};

        if (this.userInfo.userId) {
            properties.user_id = this.userInfo.userId;
        }

        if (this.userInfo.accountId) {
            properties.account_id = this.userInfo.accountId;
        }

        if (logLevel === LogLevel.Error || logLevel === LogLevel.Critical) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            properties.description = typeof message === 'string' ? message : `${message}`;
            properties.fatal = logLevel === LogLevel.Critical;

            this.firebaseAnalytics.logEvent('exception', properties);
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

            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            properties.message = typeof message === 'string' ? message : `${message}`;
            properties.level = level;

            this.firebaseAnalytics.logEvent('trace', properties);
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

        if (this.eventTiming.get(name) != null) {
            console.error(
                `The 'startTrackPage' was called more than once for this event without calling stop, name: ${name}.`
            );

            return;
        }

        this.eventTiming.set(name, +new Date());
    }

    stopTrackPage(name?: string, pageViewInfo?: PageViewTimingInfo): void {
        if (name == null) {
            name = window.document.title || '';
        }

        if (!name) {
            console.error('Could not detect document title, please provide name parameter.');

            return;
        }

        const start = this.eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackPage' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this.eventTiming.delete(name);

        if (!this.firebaseAnalytics) {
            return;
        }

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedPageViewProps(pageViewInfo);
        properties.page_title = name;

        this.firebaseAnalytics.logEvent('timing_complete', {
            ...properties,
            name: 'page_view',
            value: duration
        });
    }

    trackPageView(pageViewInfo?: PageViewInfo): void {
        if (!this.firebaseAnalytics) {
            return;
        }

        const properties = this.getMappedPageViewProps(pageViewInfo);
        if (pageViewInfo && pageViewInfo.name) {
            properties.page_title = pageViewInfo.name;
        }

        this.firebaseAnalytics.logEvent('page_view', properties);
    }

    startTrackEvent(name: string): void {
        if (this.eventTiming.get(name) != null) {
            console.error(
                `The 'startTrackEvent' was called more than once for this event without calling stop, name: ${name}.`
            );

            return;
        }

        this.eventTiming.set(name, +new Date());
    }

    stopTrackEvent(name: string, eventInfo?: EventTimingInfo): void {
        const start = this.eventTiming.get(name);
        if (start == null || isNaN(start)) {
            console.error(`The 'stopTrackEvent' was called without a corresponding start, name: ${name}.`);

            return;
        }

        this.eventTiming.delete(name);

        if (!this.firebaseAnalytics) {
            return;
        }

        const duration = Math.max(+new Date() - start, 0);
        const properties = this.getMappedEventProps(eventInfo);

        this.firebaseAnalytics.logEvent('timing_complete', {
            ...properties,
            name,
            value: duration
        });
    }

    trackEvent(eventInfo: EventInfo): void {
        if (!this.firebaseAnalytics) {
            return;
        }

        const properties = this.getMappedEventProps(eventInfo);

        this.firebaseAnalytics.logEvent(eventInfo.name, eventInfo.properties || properties);
    }

    flush(): void {
        // Do nothing
    }

    private getMappedEventProps(eventInfo?: EventTimingInfo): { [key: string]: unknown } {
        if (!eventInfo) {
            return {};
        }

        const mappedProps: { [key: string]: unknown } = {
            ...eventInfo.properties,
            ...eventInfo.measurements
        };

        if (this.userInfo.userId) {
            mappedProps.user_id = this.userInfo.userId;
        }

        if (this.userInfo.accountId) {
            mappedProps.account_id = this.userInfo.accountId;
        }

        return mappedProps;
    }

    private getMappedPageViewProps(pageViewInfo?: PageViewTimingInfo): { [key: string]: unknown } {
        if (!pageViewInfo) {
            return {};
        }

        const mappedProps: { [key: string]: unknown } = {
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

        if (this.userInfo.userId) {
            mappedProps.user_id = this.userInfo.userId;
        }

        if (this.userInfo.accountId) {
            mappedProps.account_id = this.userInfo.accountId;
        }

        return mappedProps;
    }
}
