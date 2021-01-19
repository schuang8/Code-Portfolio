import { Component, HostListener } from '@angular/core';
import { ColDef, GridOptions, SelectionChangedEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

import { DataService } from 'src/app/services/data.service';
import { RegexString } from 'src/app/data-models/regex';

import { column1, column2, column3, column4 } from './ColumnDef';

const columns: ColDef[] = [
  column1,
  column2,
  column3,
  column4,
];

@Component({
  selector: 'app-ag-grid-example',
  templateUrl: './ag-grid-example.component.html',
  styleUrls: ['./ag-grid-example.component.scss']
})
export class AgGridExampleComponent {

  private readonly regexCol1 = new RegExp(RegexString.RegexCol1);
	private readonly regexCol2 = new RegExp(RegexString.RegexCol2);
  private readonly regexCol3 = new RegExp(RegexString.RegexCol3);
  
  private gridApi;
  isActionDisabled = true;
  columns: ColDef[];
  private _unsubscribe = new Subject();

  constructor(private dataService: DataService) {
    this.columns = columns;
    this.dataService.getAllData();
    this.dataService.getData().pipe(takeUntil(this._unsubscribe)).subscribe(data => {
      this.isActionDisabled = true;
      if (this.gridApi) {
        this.gridApi.setRowData(data);
      }
    });
  }

  gridOptions: GridOptions = {
    onGridReady: (params) => {
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }
  };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    if ((event.api.getSelectedNodes().length > 0)) {
      this.isActionDisabled = this.checkValidFormSate(event.api.getSelectedNodes());
    } else {
      this.isActionDisabled = true;
    }
  }

  onCellValueChanged(event) {
    const newEntry = event.data;
    if ((event.api.getSelectedNodes().length > 0)) {
      this.isActionDisabled = this.checkValidFormSate(event.api.getSelectedNodes());
    } else {
      this.isActionDisabled = true;
    }

    if (event.colDef.field === 'column1') {
      if (!this.regexCol1.test(event.newValue)) {
        return;
      }
    }
    if (event.colDef.field === 'column2') {
      if (!this.regexCol2.test(event.newValue)) {
        return;
      }
    }
    if (event.colDef.field === 'column3') {
      if (!this.regexCol3.test(event.newValue)) {
        return;
      }
    }

    if (event.colDef.field === 'column4') {
      this.gridApi.redrawRows();
      this.gridApi.sizeColumnsToFit();
    }
    this.gridApi.deselectAll();

    if (newEntry.column1 !== '' && newEntry.column4 !== '') {
      this.dataService.addData(newEntry);
    }
  }

  addNew() {
    this.gridApi.applyTransaction({ add: {column1: 'new' }, addIndex: this.gridApi.getSelectedNodes().length - 1 });
  }

  deleteEntry() {
    const deleteCb = () => {
      const selectedNodes = this.gridApi().getSelectedNodes();
      selectedNodes.forEach(node => {
        this.dataService.deleteEntry(node.column1);
        node.setSelected(false);
      });
    };
    this.isActionDisabled = true;
  }

  showPassword(event) {
    if (event) {
      const ind = this.columns.findIndex(ele => ele.field === 'column3');
      this.columns[ind].cellRendererParams.showPassword = event.checked;
      let instances = this.gridApi.getCellRendererInstances({ columns: ['column3'] });
      instances.forEach(inst => {
        let component = inst.getFrameworkComponentInstance();
        component.showPassword(event.checked);
      });
    }
  }

  checkValidFormSate(rows): boolean {
    let disable: boolean;
    rows.some(row => {
      if (!this.regexCol1.test(row.data.column1)) {
        disable = true;
        return true;
      }
      if (row.data.column4.match(this.regexCol2)) {
        disable = true;
        return true;
      }
      disable = false;
    });
    return disable;
  }
}