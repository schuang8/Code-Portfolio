import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MethodsService } from '../../services/methods.service';

@Component({
  selector: 'app-property-tree-ratio',
  templateUrl: './property-tree-ratio.component.html',
  styleUrls: ['./property-tree-ratio.component.css']
})
export class PropertyTreeRatioComponent {

    @Input() allocation;
    @Input() index;
    @Input() plusFlag;

    constructor(private methodsService: MethodsService) {
    }

    onChangeRatio(event) {
        event.preventDefault();
        this.allocation[this.index] = (event.target.value);
    }
}
