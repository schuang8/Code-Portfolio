import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MethodsService } from '../../services/methods.service';

@Component({
  selector: 'app-property-tree-stocks',
  templateUrl: './property-tree-stocks.component.html',
  styleUrls: ['./property-tree-stocks.component.css']
})
export class PropertyTreeStocksComponent {

    @Input() tstock;
    @Input() index;

    constructor(private methodsService: MethodsService) {}

    onChangeStock(event) {
        event.preventDefault();
        this.tstock[this.index] = event.target.value;
    }
}
