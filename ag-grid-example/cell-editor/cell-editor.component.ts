import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellEditorAngularComp } from "ag-grid-angular";
import { RegexString } from 'src/app/data-models/regex'; // Regex constants

@Component({
	selector: 'cell-editor',
	templateUrl: './cell-editor.component.html',
	styleUrls: ['./cell-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CellEditorComponent extends ICellEditorAngularComp {
	@ViewChild('input', { static: true }) input: ElementRef;

	private readonly regexCol1 = new RegExp(RegexString.RegexCol1);
	private readonly regexCol2 = new RegExp(RegexString.RegexCol2);
	private readonly regexCol3 = new RegExp(RegexString.RegexCol3);

	params: any;
	value: string;
	fieldState: string = 'optional';

	defaults(): any {
        return null;
	}
	
	valueChange(event) {
		if (event) {
			this.checkField(this.value, this.params.colDef.field);
		}
	}

	focusIn(): void {
		this.input.nativeElement.focus();
	}

	agInit(params: any & ICellEditorParams) {
		this.setParams(params);
		this.checkField(this.value, params.colDef.field);
	}

	refresh(params: any & ICellEditorParams): boolean {
		this.setParams(params);
		this.checkField(this.value, this.params.colDef.field);
		return true;
	}

	onChange(newValue: any) {
		this.params.setValue(newValue);
		this.checkField(this.value, this.params.colDef.field);
	}

	protected setParams(params: any & ICellEditorParams) {
		const defaults = this.defaults() || {};
		this.params = { ...defaults, ...params };
		this.value = this.params.value;
	}

	checkField(value: string, coldef: string) {
		if (coldef === 'column1') {
            if (this.regexCol1.test(value)) {
				this.fieldState = 'optional';
			} else {
				if (value) {
					this.fieldState = 'error';
				} else {
					this.fieldState = 'required';
            	}
			}
        }
		if (coldef === 'column2') {
			if (this.params.data.column4 === 'col4value1') {
				if (this.regexCol2.test(value)) {
					this.fieldState = 'optional';
				} else {
					if (!value) {
						this.fieldState = 'required';
					}
				}
			} else if (this.params.data.column4 === 'col4value2') {
				if (value) {
					if (!this.regexCol2.test(value)) {
						this.fieldState = 'error';
					}
				} else {
					this.fieldState = 'optional';
				}
			} else {
				this.fieldState = 'disabled';
			}
		}
		if (coldef === 'column3') {
			if (this.params.data.column4 === 'col4value1') {
				if (this.regexCol3.test(value)) {
					this.fieldState = 'optional';
				} else {
					if (!value) {
						this.fieldState = 'required';
					}
				}
			} else {
				this.fieldState = 'disabled';
			}
		}
	}
}