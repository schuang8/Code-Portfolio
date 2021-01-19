import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject, Observable } from 'rxjs';
import { debounceTime, filter, map, mergeMap, pluck, take, takeUntil } from 'rxjs/operators';
import { BackendService } from '@backend-service';

export enum InstallProcessState {
    Installing = 0,
    Cancelling = 1,
    Finished = 2,
    Cancelled = 3,
    Failed = 4
  }

@Injectable({
    providedIn: 'root'
})
export class InstallProcessService {
    private _unSubscribe: Subject<any> = new Subject();
    private installInfo;
    private toCancel: Subject<boolean> = new Subject<boolean>();
    public cancelPressed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public processState: BehaviorSubject<InstallProcessState> = new BehaviorSubject<InstallProcessState>(InstallProcessState.Installing);

    constructor(private backendService: BackendService){}

    startInstallProcess(installInfo) {
        this.installInfo = installInfo;
        this.cancelPressed.next(false);
        // Triger install process
        this.backendService.set('TriggerInstall');
        this.processState.next(InstallProcessState.Installing);
        const installReadyObs = this.backendService.get('InstallFinished')
            .pipe(takeUntil(this._unSubscribe),
                pluck('value'),
                filter(val => val === true),
                mergeMap(() => {
                    return this.backendService.get(this.installInfo.resourceId);
                }),
                debounceTime(1000),
                take(1),
                );
        const cancelInterruptObs = this.cancelInterrupt();         

        combineLatest(installReadyObs, cancelInterruptObs)
        .pipe(takeUntil(this._unSubscribe))
        .subscribe(([isReady, cancelPressed]) => {
            if (isReady) {
                if (!cancelPressed && this.processState.value !== InstallProcessState.Finished) {
                    this.processState.next(InstallProcessState.Finished);
                } else if (cancelPressed) {
                    if (this.processState.value !== InstallProcessState.Cancelling) {
                        this.waitForCancelResponse().then((resp) => {
                            if (resp) {
                                this.processState.next(InstallProcessState.Cancelling);
                                this.uninstall();
                            } else {
                                this.processState.next(InstallProcessState.Finished);
                            }
                        });
                    } else if (this.processState.value === InstallProcessState.Cancelling) {
                        this.uninstall();
                    }
                }
            }
            if (isReady === false) {
                this.processState.next(InstallProcessState.Failed);
            }
        });

        // Subscribe to cancel interrupt while waiting for garbage isReady values to resolve
        cancelInterruptObs.pipe(takeUntil(this._unSubscribe))
            .subscribe((cancelPressed) => {
                if (cancelPressed && this.processState.value !== InstallProcessState.Cancelling) {
                    this.waitForCancelResponse().then((resp) => {
                        if (resp && this.processState.value !== InstallProcessState.Failed) {
                            this.processState.next(InstallProcessState.Cancelling);
                        }
                    });
                }
        });
    }

    getProcessState() {
        return this.processState.asObservable();
    }

    cancelInterrupt(): Observable<any> {
        return this.cancelPressed.asObservable();
    }

    cancelInstallation() {
        this.toCancel.next(true);
    }

    abortCancel() {
        this.toCancel.next(false);
        this.cancel(false);
    }

    cancel(state: boolean) {
        this.cancelPressed.next(state);
    }

    uninstall() {
        this.backendService.getResourceIds().pipe(map(ids => {
          return ids.findIndex((id) => id === this.installInfo.resourceId);
        }), take(1)).subscribe(index => {
          if (index === -1) {
            console.error('Unable to uninstall ', this.installInfo.resourceId, '. Resource Id not found');
            return;
          }
          this.backendService.set('Uninstall');
          setTimeout(() => {
            this.backendService.getResourceIds().pipe(map(ids => {
                return ids.findIndex((id) => id === this.installInfo.resourceId);
              }), take(1)).subscribe(index => {
                if (index === -1) {
                    if (this.processState.value === InstallProcessState.Cancelling) {
                        this.processState.next(InstallProcessState.Cancelled);
                    }
                }
            });
          }, 10000);
        });
    }

    waitForCancelResponse() {
        return new Promise((resolve, reject) => {
            this.toCancel.asObservable().pipe(takeUntil(this._unSubscribe))
            .subscribe((isCancel) => {
                resolve(isCancel);
            });
        });
    }
}
