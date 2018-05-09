import { Component, OnInit, Inject, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { DisplayConfigTree, DisplaySetting } from '../components/display.component';

import { DataService } from '../services/data.service';
import { DraggableService } from '../services/draggable.service';
import {
    MOCK_AWGN_DATA,
    MOCK_IQ_ADJUST_DATA,
    MOCK_PHASE_NOISE_DATA,
    MOCK_CHANNEL_FILTERING_DATA } from '../components/shared/models/mock-dataSettings';
import { SelectedNodeService } from '../services/selected-node.service';
import { slideInOutAnimation } from '../components/animations';



@Component({
    selector: 'app-adjustments',
    templateUrl: './adjustments.component.html',
    styleUrls: ['./adjustments.component.scss'],
    animations: [slideInOutAnimation]
})
export class AdjustmentsComponent implements OnDestroy {

    slideWindow: string;
    moduleId: number;
    private _unsubscribe: Subject<any> = new Subject<any>();
    @ViewChild('dragTitleBar') titleBar: ElementRef;
    settings: any;
    selectedGroup;

    constructor(private _dataService: DataService, public dialogRef: MatDialogRef<AdjustmentsComponent>,
        private _dialogService: MatDialog,
        private _draggableService: DraggableService,
        private _selectedNodeService: SelectedNodeService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        // Set the window slide direction by the
        // data in the dialog config.
        this.slideWindow = this.data.slide;

        this._dataService.getObservable().takeUntil(this._unsubscribe).subscribe((configs: DisplayConfigTree[]) => {
            configs.filter((config: DisplayConfigTree) => config.moduleId === 'signal_module').forEach((config: DisplayConfigTree) => {
                this.moduleId = config.id;

                if (this.selectedGroup) {
                    this.selectedGroup = this.settings.find(settingGroup => {
                        return settingGroup.displayName === this.selectedGroup.displayName;
                    });
                }
            });
        });

        this._selectedNodeService.selectedNode$
            .takeUntil(this._unsubscribe)
            .subscribe((setting) => {
                this.selectedGroup = setting;
            });
    }

    ngOnDestroy() {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    btnClose() {
        this.dialogRef.close();
    }

    configure(setting) {
        this.selectedGroup = setting;
    }

    toggle(settingObj) {
        event.stopPropagation();
        const value = (settingObj.settings[0].value === 'Off' ? 'On' : 'Off');
        this._dataService.updateConfigurable(this.moduleId, [new DisplaySetting(settingObj.settings[0].id, value)]);
        
    }
}
