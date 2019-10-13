# Angular Firebase Analytics Implementation for NG-LOG

[![Build Status](https://dev.azure.com/DagonMetric/ng-log-firebase-analytics/_apis/build/status/DagonMetric.ng-log-firebase-analytics?branchName=master)](https://dev.azure.com/DagonMetric/ng-log-firebase-analytics/_build/latest?definitionId=14&branchName=master)
[![CircleCI](https://circleci.com/gh/DagonMetric/ng-log-firebase-analytics.svg?style=svg)](https://circleci.com/gh/DagonMetric/ng-log-firebase-analytics)
[![npm version](https://img.shields.io/npm/v/@dagonmetric/ng-log-firebase-analytics.svg)](https://www.npmjs.com/package/@dagonmetric/ng-log-firebase-analytics)
[![Gitter](https://badges.gitter.im/DagonMetric/general.svg)](https://gitter.im/DagonMetric/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Firebase Analytics implementation for [@dagonmetric/ng-log](https://github.com/DagonMetric/ng-log).

## Getting Started

### Prerequisites

The following npm packages are required before using this module.

* @angular/common >= v8.0.0-beta.0
* @angular/core >= v8.0.0-beta.0
* @dagonmetric/ng-log >= v2.2.0
* firebase >= v7.2.0

### Installation

npm

```bash
npm install @dagonmetric/ng-log-firebase-analytics
```

or yarn

```bash
yarn add @dagonmetric/ng-log-firebase-analytics
```

### Module Setup (app.module.ts)

```typescript
import { LogModule } from '@dagonmetric/ng-log';
import { FirebaseAnalyticsLoggerModule } from '@dagonmetric/ng-log-firebase-analytics';

@NgModule({
  imports: [
    // Other module imports

    // ng-log modules
    LogModule,
    FirebaseAnalyticsLoggerModule.config({
      firebase : {
          apiKey: '<your_firebase_app_api_key>',
          projectId: '<your_firebase_project_id>',
          appId: '<your_firebase_app_id>',
          // Replace 'G-1111111111' with your measurementId
          measurementId: 'G-1111111111',
          // ...
      }
    })
  ]
})
export class AppModule { }
```

### Usage (app.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';

import { LogService } from '@dagonmetric/ng-log';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private readonly _logService: LogService) { }

  ngOnInit(): void {
    // Track traces
    this._logService.trace('Testing trace');
    this._logService.debug('Testing debug');
    this._logService.info('Testing info');
    this._logService.warn('Testing warn');

    // Track exceptions
    this._logService.error(new Error('Testing error'));
    this._logService.fatal(new Error('Testing critical'));

    // Track page view
    this._logService.trackPageView({
      name: 'My Angular App',
      uri: '/home'
    });

    // Track page view with timing
    this._logService.startTrackPage('about');
    this._logService.stopTrackPage('about', { uri: '/about' });

    // Track custom event
    this._logService.trackEvent({
      name: 'video_auto_play_start',
      properties: {
        non_interaction: true
      }
    });

    // Track custom event with timing
    this._logService.startTrackEvent('video_auto_play');
    this._logService.stopTrackEvent('video_auto_play', {
      properties: {
        non_interaction: true
      }
    });

    // Set user properties
    this._logService.setUserProperties('<Authenticated User Id>', '<Account Id>');

    // Clear user properties
    this._logService.clearUserProperties();
  }
}
```

## Related Projects

* [ng-log](https://github.com/DagonMetric/ng-log) - Angular logging and telemetry service abstractions and some implementations
* [ng-log-applicationinsights](https://github.com/DagonMetric/ng-log-applicationinsights) - Microsoft Azure Application Insights implementation for `ng-log`
* [ng-log-gtag](https://github.com/DagonMetric/ng-log-gtag) - Angular Google Analytics (gtag.js) logger implementation for `ng-log`

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-log-firebase-analytics/blob/master/CONTRIBUTING.md) page to see the best places to log issues and start discussions.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-log-firebase-analytics/blob/master/LICENSE) license.
