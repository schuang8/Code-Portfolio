import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlvizComponent } from './../glviz/glviz.component';

import { PropertyTreeComponent } from './property-tree.component';
import { PropertyTreeStocksComponent } from './property-tree-stocks/property-tree-stocks.component';
import { PropertyTreeRatioComponent } from './property-tree-ratio/property-tree-ratio.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        PropertyTreeComponent
    ],
    declarations: [
        PropertyTreeComponent,
        PropertyTreeStocksComponent,
        PropertyTreeRatioComponent,
        GlvizComponent
    ]
})
export class PropertyTreeModule {
}