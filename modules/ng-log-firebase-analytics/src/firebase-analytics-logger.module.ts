/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';

import { LOGGER_PROVIDER } from '@dagonmetric/ng-log';

import { FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN, FirebaseAnalyticsLoggerOptions } from './firebase-analytics-logger-options';
import { FirebaseAnalyticsLoggerProvider } from './firebase-analytics-logger-provider';

import { FIREBASE_APP, FirebaseApp } from './firebase-app';

// This import loads the firebase namespace along with all its type information.
import * as firebase from 'firebase/app';

export function firebaseAppFactory(options: FirebaseAnalyticsLoggerOptions): FirebaseApp {
    const appName = options.appName || '[DEFAULT]';
    const firebaseOptions = options.firebase;

    const existingApp = firebase.apps.filter(app => app && app.name === appName)[0];

    return (existingApp || firebase.initializeApp(firebaseOptions, appName)) as FirebaseApp;
}

/**
 * The `NGMODULE` for providing `LOGGER_PROVIDER` with `FirebaseAnalyticsLoggerProvider`.
 */
@NgModule({
    providers: [
        {
            provide: LOGGER_PROVIDER,
            useClass: FirebaseAnalyticsLoggerProvider,
            multi: true
        },
        {
            provide: FIREBASE_APP,
            useFactory: firebaseAppFactory,
            deps: [
                FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN
            ]
        }
    ]
})
export class FirebaseAnalyticsLoggerModule {
    static config(options: FirebaseAnalyticsLoggerOptions): ModuleWithProviders {
        return {
            ngModule: FirebaseAnalyticsLoggerModule,
            providers: [
                {
                    provide: FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN,
                    useValue: options
                }
            ]
        };
    }
}
