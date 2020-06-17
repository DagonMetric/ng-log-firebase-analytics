/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

import { FirebaseConfig } from './firebase-config';

export interface FirebaseAnalyticsLoggerOptions {
    firebaseConfig: FirebaseConfig;
    appName?: string;
    analyticsCollectionEnabled?: boolean;
}

export const FIREBASE_ANALYTICS_LOGGER_OPTIONS = new InjectionToken<FirebaseAnalyticsLoggerOptions>(
    'FirebaseAnalyticsLoggerOptions'
);
