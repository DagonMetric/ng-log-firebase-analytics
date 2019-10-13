/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

export interface FirebaseOptions {
    measurementId: string;
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

export interface FirebaseAnalyticsLoggerOptions {
    firebase: FirebaseOptions;
    appName?: string;
}

export const FIREBASE_ANALYTICS_LOGGER_OPTIONS_TOKEN = new InjectionToken<FirebaseAnalyticsLoggerOptions>('FirebaseAnalyticsLoggerOptions');
