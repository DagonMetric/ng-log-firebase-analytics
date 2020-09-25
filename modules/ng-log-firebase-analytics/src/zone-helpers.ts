/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SchedulerAction, SchedulerLike, Subscription, queueScheduler } from 'rxjs';

export class ZoneScheduler implements SchedulerLike {
    constructor(private zone: any, private delegate = queueScheduler) {}

    now(): number {
        return this.delegate.now();
    }

    // eslint-disable-next-line no-shadow
    schedule(work: (this: SchedulerAction<any>, state?: any) => void, delay?: number, state?: any): Subscription {
        const targetZone = this.zone;

        const workInZone = function (this: SchedulerAction<unknown>, stateLocal: unknown) {
            targetZone.runGuarded(() => {
                work.apply(this, [stateLocal]);
            });
        };

        return this.delegate.schedule(workInZone, delay, state);
    }
}
