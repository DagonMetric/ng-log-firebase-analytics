import * as firebase from 'firebase/app';

import { FirebaseAnalyticsLoggerOptions } from './firebase-analytics-logger-options';

import { FirebaseApp } from './firebase-app';

export function firebaseAppFactory(options: FirebaseAnalyticsLoggerOptions): FirebaseApp {
    const appName = options.appName || '[DEFAULT]';
    const firebaseOptions = options.firebase;

    const existingApp = firebase.apps.filter(app => app && app.name === appName)[0];

    return (existingApp || firebase.initializeApp(firebaseOptions, appName)) as FirebaseApp;
}
