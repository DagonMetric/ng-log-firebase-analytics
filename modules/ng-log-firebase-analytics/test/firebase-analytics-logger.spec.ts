// tslint:disable: no-floating-promises

import { LogLevel } from '@dagonmetric/ng-log';

import { analytics } from 'firebase/app';

import { FirebaseAnalyticsLogger } from '../src/firebase-analytics-logger';

describe('FirebaseAnalyticsLogger', () => {
    let logger: FirebaseAnalyticsLogger;
    let firebaseAnalytics: analytics.Analytics;

    beforeEach(() => {
        firebaseAnalytics = jasmine.createSpyObj<analytics.Analytics>(
            'analytics', [
            'logEvent'
        ]);

        logger = new FirebaseAnalyticsLogger('test', {}, firebaseAnalytics);
    });

    it("should work with 'log' method", () => {
        const message = 'This is a message.';
        const err = new Error(message);
        const properties = { key1: 'value1' };

        logger.log(LogLevel.Trace, err, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('trace', {
            message: `${err}`,
            level: 'trace',
            key1: 'value1'
        });

        logger.log(LogLevel.Debug, message, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('trace', {
            message,
            level: 'debug',
            key1: 'value1'
        });

        logger.log(LogLevel.Info, message, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('trace', {
            message,
            level: 'info',
            key1: 'value1'
        });

        logger.log(LogLevel.Warn, message, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('trace', {
            message,
            level: 'warn',
            key1: 'value1'
        });

        logger.log(LogLevel.Error, message, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('exception', {
            description: message,
            fatal: false,
            key1: 'value1'
        });

        logger.log(LogLevel.Critical, err, { properties });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('exception', {
            description: `${err}`,
            fatal: true,
            key1: 'value1'
        });
    });

    it("should not track 'log' when 'logLevel' is 'None'", () => {
        logger.log(LogLevel.None, 'This is a message.');

        // tslint:disable-next-line: no-any no-unsafe-any
        expect((firebaseAnalytics.logEvent as any).calls.count()).toEqual(0);
    });

    it("should work with 'startTrackPage' and 'stopTrackPage'", () => {
        logger.startTrackPage('home');
        logger.stopTrackPage('home');
        expect(firebaseAnalytics.logEvent).toHaveBeenCalled();
    });

    it("should work with 'trackPageView'", () => {
        logger.trackPageView({
            name: 'home',
            uri: 'https://example.com/home',
            ref_uri: 'https://somewhere.com/',
            page_type: 'formPage',
            is_logged_in: false,
            properties: {
                key1: 'value1'
            }
        });
        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('page_view', {
            page_title: 'home',
            page_location: 'https://example.com/home',
            key1: 'value1',
            ref_uri: 'https://somewhere.com/',
            page_type: 'formPage',
            is_logged_in: false
        });
    });

    it("should work with 'startTrackEvent' and 'stopTrackEvent'", () => {
        const eventName = 'event1';
        logger.startTrackEvent(eventName);
        logger.stopTrackEvent(eventName);
        expect(firebaseAnalytics.logEvent).toHaveBeenCalled();
    });

    it("should work with 'trackEvent'", () => {
        logger.trackEvent({
            name: 'event1',
            properties: {
                key1: 'value1'
            }
        });

        // Coverage only
        // logger.flush();

        expect(firebaseAnalytics.logEvent).toHaveBeenCalledWith('event1', {
            key1: 'value1'
        });
    });
});
