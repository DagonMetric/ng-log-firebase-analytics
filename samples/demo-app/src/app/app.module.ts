import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// ng-log
import { LogModule } from '@dagonmetric/ng-log';
import { FirebaseAnalyticsLoggerModule } from '@dagonmetric/ng-log-firebase-analytics';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,

        // ng-log imports
        //
        LogModule.withConfig({
            minLevel: 'debug'
        }),
        FirebaseAnalyticsLoggerModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
