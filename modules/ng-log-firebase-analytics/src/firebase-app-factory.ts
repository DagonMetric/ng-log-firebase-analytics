/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgZone } from '@angular/core';

import * as firebase from 'firebase/app';

import { FirebaseConfig } from './firebase-config';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function firebaseAppFactory(options: FirebaseConfig, zone: NgZone, appName?: string): firebase.app.App {
    appName = appName || '[DEFAULT]';

    const existingApp = firebase.apps.filter((app) => app && app.name === appName)[0];

    return existingApp || zone.runOutsideAngular(() => firebase.initializeApp(options, appName));
}
