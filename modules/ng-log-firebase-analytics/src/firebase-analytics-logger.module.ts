/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';

import { LOGGER_PROVIDER } from '@dagonmetric/ng-log';

import { FIREBASE_ANALYTICS_LOGGER_OPTIONS, FirebaseAnalyticsLoggerOptions } from './firebase-analytics-logger-options';
import { FirebaseAnalyticsLoggerProvider } from './firebase-analytics-logger-provider';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function analyticsAppInitializerFactory(loggerProvider: FirebaseAnalyticsLoggerProvider): () => Promise<void> {
    const res = async () => loggerProvider.initialize().toPromise();

    return res;
}

/**
 * The `NGMODULE` for providing `LOGGER_PROVIDER` with `FirebaseAnalyticsLoggerProvider`.
 */
@NgModule({
    providers: [
        FirebaseAnalyticsLoggerProvider,
        {
            provide: LOGGER_PROVIDER,
            useExisting: FirebaseAnalyticsLoggerProvider,
            multi: true
        }
    ]
})
export class FirebaseAnalyticsLoggerModule {
    static configure(options: FirebaseAnalyticsLoggerOptions): ModuleWithProviders<FirebaseAnalyticsLoggerModule> {
        return {
            ngModule: FirebaseAnalyticsLoggerModule,
            providers: [
                {
                    provide: FIREBASE_ANALYTICS_LOGGER_OPTIONS,
                    useValue: options
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: analyticsAppInitializerFactory,
                    deps: [FirebaseAnalyticsLoggerProvider],
                    multi: true
                }
            ]
        };
    }
}
