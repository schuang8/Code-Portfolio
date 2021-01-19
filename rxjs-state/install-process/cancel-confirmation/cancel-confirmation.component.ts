import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InstallProcessService } from '../../install-process.service';

@Component({
    selector: 'app-cancel-confirmation',
    templateUrl: './cancel-confirmation.component.html',
    styleUrls: ['./cancel-confirmation.component.scss']
})
export class CancelConfirmationComponent {
    constructor(
        private dialog: MatDialog,
        private installProcessService: InstallProcessService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    onFinished() {
        this.installProcessService.cancelInstallation();
        this.dialog.close();
    }

    onClose() {
        this.installProcessService.abortCancel();
        this.dialog.close();
    }
}
