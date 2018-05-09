/* tslint:disable:no-use-before-declare */
// Unit Tests for Adjustments Compoonent
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Component, Input, NgModule, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AdjustmentsComponent } from './adjustments.component';
import { DataService } from '../services/data.service';
import { DataServiceStub } from '../stubs/data-service-stub';
import { DraggableService } from '../services/draggable.service';
import { PropertyElementModule } from '../components/auto-hint-input/property-element.module';
import { SelectedNodeService} from '../services/selected-node.service';
import { SettingEditorComponent } from '../components/setting-editor/setting-editor.component';
import { SettingsGroupTileComponent } from '../components/settings-group-tile/settings-group-tile.component';

describe('AdjustmentsComponent', () => {
    let component: AdjustmentsComponent;
    let fixture: ComponentFixture<AdjustmentsComponent>;
    let dialog: MatDialog;
    let _dialogRef: MatDialogRef<AdjustmentsComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [
          AdjustmentsTestModule
        ],
        providers: [
          DraggableService
        ]
      })
        .compileComponents();
    }));

    beforeEach(inject([MatDialog],
      (d: MatDialog) => {
        dialog = d;
      }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AdjustmentsComponent);
      component = fixture.componentInstance;
      _dialogRef = component.dialogRef;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should open a dialog with a component', () => {
      const dialogRef = dialog.open(AdjustmentsComponent, {
      });
    });

    it('should trigger btnClose function', () => {
      const btnSpy = spyOn(_dialogRef, 'close').and.callThrough();
      component.btnClose();
      expect(btnSpy).toHaveBeenCalled();
    });

    it('configure method should be able to set selectGroup', () => {
      const tmp = 'tmp';
      component.configure(tmp);
      expect(component.selectedGroup).toBe('tmp');
    });
});

class MatDialogStub {
    open() { }
}

class MatDialogRefStub {
      static closeFlag = false;
      close() {
        MatDialogRefStub.closeFlag = true;
      }
}

const TEST_MODULES = [
      AdjustmentsComponent,
      SettingEditorComponent,
      SettingsGroupTileComponent,
];

@NgModule({
      declarations: TEST_MODULES,
      exports: TEST_MODULES,
      imports: [
            CommonModule,
            FormsModule,
            PropertyElementModule,
            NoopAnimationsModule,
            MatDialogModule
      ],
      entryComponents: [
      ],
      providers: [
        {
          provide: DataService,
          useClass: DataServiceStub
        },
        { provide: MatDialog, useClass: MatDialogStub },
        {
          provide: MatDialogRef,
          useClass: MatDialogRefStub
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
                key: null,
                slide: 'right'
          }
        },
        {provide: SelectedNodeService, useClass: SelectedNodeService }
      ]
})
class AdjustmentsTestModule { }
