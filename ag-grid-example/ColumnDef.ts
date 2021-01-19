import { ColDef } from 'ag-grid-community';

import { CellEditorComponent } from './cell-editor/cell-editor.component';
import { CellRendererComponent } from './cell-renderer/cell-renderer.component';

export const column1: ColDef = {
    colId: 'Column1',
    headerName: 'Column 1',
    field: 'column1',
    editable: true,
    cellEditorFramework: CellEditorComponent,
    cellRendererFramework: CellRendererComponent,
    cellRendererParams: {
      checkbox: true,
    },
    suppressCellFlash: true,
    minWidth: 150,
};
  
export const column2: ColDef = {
    headerName: 'Column 2',
    field: 'column2',
    editable: (params) => {
      const selectedValue = params.node.data.column4;
      return selectedValue === 'value1' || selectedValue === 'value2';
    },
    cellStyle: (params) => {
      const selectedValue = params.data.column4;
      if (selectedValue === 'value1') {
        return { opacity: 'var(--opacity-disabled, 0.3)' };
      } else {
        return null;
      }
    },
    cellEditorFramework: CellEditorComponent,
    cellRendererFramework: CellRendererComponent,
    suppressCellFlash: true,
    minWidth: 150
};
  
export const column3: ColDef = {
    headerName: 'Column 3',
    field: 'column3',
    editable: (params) => {
      const selectedValue = params.node.data.column4;
      return selectedValue === 'value1';
    },
    cellStyle: (params) => {
      const selectedValue = params.data.column4;
      if (selectedValue === 'value1' || selectedValue === 'value2') {
        return { opacity: 'var(--opacity-disabled, 0.3)' };
      } else {
        return null;
      }
    },
    cellEditorFramework: CellEditorComponent,
    cellRendererFramework: CellRendererComponent,
    cellRendererParams: {
      showPassword: false
    },
    suppressCellFlash: true,
    minWidth: 150
};
  
export const column4: ColDef = {
    headerName: 'Column 4',
    field: 'column4',
    editable: (params) => {
      const selectedValue = params.node.data.column1;
      return selectedValue !== '';
    },
    cellEditorParams: {
      editor: 'comboBox'
    },
    cellRendererParams: {
      options: ['value1', 'value2', 'value3'],
      showAs: 'comboBox'
    },
    suppressCellFlash: true,
    minWidth: 230
};