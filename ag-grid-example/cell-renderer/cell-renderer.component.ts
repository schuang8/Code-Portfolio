import { Component, HostBinding, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { RegexString } from 'src/app/data-models/regex'; // Regex constants

@Component({
    selector: 'cell-renderer',
    templateUrl: './cell-renderer.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./cell-renderer.component.scss'],
})
export class CellRendererComponent extends ICellRendererAngularComp {
    @HostBinding('class.cell-renderer') clazz = true;
    @ViewChild('input', { static: true }) input: ElementRef;

    private readonly regexCol1 = new RegExp(RegexString.RegexCol1);
	private readonly regexCol2 = new RegExp(RegexString.RegexCol2);
	private readonly regexCol3 = new RegExp(RegexString.RegexCol3);

    params: any;
    value: string;
    fieldState: string = 'optional';
    inputType: string = 'text';
	placeholder = 'password';

    constructor(private renderer: Renderer2) {
        super();
    }

    defaults(): any {
        return null;
    }

    agInit(params: any & ICellRendererParams) {
        this.setParams(params);
        this.checkField(this.value, params.colDef.field);
        if (params.colDef.field === 'column3' && !params.showPassword) {
            this.renderer.setAttribute(this.input.nativeElement, 'type', 'password');
        } else {
            this.renderer.setAttribute(this.input.nativeElement, 'type', 'text');
        }
    }

    refresh(params: any & ICellRendererParams): boolean {
        this.setParams(params);
        this.checkField(params.value, params.colDef.field);
        return true;
    }

    onChange(newValue: any) {
        this.params.setValue(newValue);
        this.checkField(this.value, this.params.colDef.field);
    }

    protected setParams(params: any & ICellRendererParams) {
        const defaults = this.defaults() || {};
        this.params = { ...defaults, ...params };
        if (params.colDef.field === 'column3' && !params.showPassword) {
            if (params.value) {
                this.value = this.placeholder;
            } else {
                this.value = this.params.value;
            }
        } else {
            this.value = this.params.value;
        }
    }

    showPassword(show: boolean) {
        if (this.params.colDef.field === 'column3') {
            if (show) {
                this.renderer.setAttribute(this.input.nativeElement, 'type', 'text');
                this.value = this.params.value;
            } else {
                this.renderer.setAttribute(this.input.nativeElement, 'type', 'password');
                if (this.params.value) {
                    this.value = this.placeholder;
                }
            }
        }
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