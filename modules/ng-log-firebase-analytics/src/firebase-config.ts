/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

export interface FirebaseConfig {
    measurementId: string;
    apiKey?: string;
    projectId?: string;
    appId?: string;
    authDomain?: string;
    databaseURL?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    [key: string]: string | undefined;
}
