import { AfterViewInit, Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BackendService } from '@backend-service';

import { InstallProcessService, InstallProcessState } from '../install-process.service';
import { CancelConfirmationComponent } from './../install-process/cancel-confirmation/cancel-confirmation.component';

@Component({
  selector: 'app-install-process',
  templateUrl: './install-process.component.html',
  styleUrls: ['./install-process.component.scss'],
})
export class InstallProcessComponent implements OnInit, AfterViewInit, OnDestroy {
  private _unSubscribe: Subject<any> = new Subject();
  public processState = InstallProcessState.Installing;
  public installProcessState: InstallProcessState;
  public installInfo: any;

  constructor(
    private dialog: MatDialog,
    private backendService: BackendService,
    private installProcessService: InstallProcessService,
    private ngZone: NgZone
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    if (this.data.content) {
      this.installInfo = this.data.content.installInfo;
    }
    this.installProcessService.startInstallProcess(this.data.content.installInfo);
  }

  ngAfterViewInit() {
    this.installProcessService.getProcessState()
    .pipe(takeUntil(this._unSubscribe))
    .subscribe((processState) => {
      if (this.processState !== processState) {
        this.processState = processState;
        this.data.dialogRef.componentInstance.focus();
      }
    });
  }

  onClose() {
    if (this.processState === InstallProcessState.Installing) {
      this.installProcessService.cancel(true);
      this.cancelConfirmationDialog(); 
    } else if (this.processState === InstallProcessState.Cancelled || this.processState === InstallProcessState.Finished || this.processState === InstallProcessState.Failed) {
      this.dialog.close();
    }
  }

  onFinished(data) {
    if (data['Install Package(s)'].launch && this.installProcessService.processState.value === InstallProcessState.Finished) {
      this.ngZone.onStable.pipe(take(1)).subscribe(() => {
        this.backendService.launchInstalled(this.installInfo.resourceId);
      });
      this.dialog.close();
    }
  }

  cancelConfirmationDialog() {
    const CANCEL_DIALOG_CONFIG: MatDialogConfig = {
        panelClass: 'cancel-dialog',
        id: 'cancel-id',
        width: '420px',
        height: '400px',
        data: {
          orientVertical: true,
          installInfo: this.installInfo
        },
        autoFocus: false,
        hasBackdrop: true,
        disableClose: true,
      };
      this.dialog.open(CancelConfirmationComponent, CANCEL_DIALOG_CONFIG);
  }

  resetBackendInstallFinished() {
    this.backendService.set('InstallPluginFinished');
  }

  ngOnDestroy() {
    this._unSubscribe.next();
    this._unSubscribe.complete();
    this.resetBackendInstallFinished();
  }

}
