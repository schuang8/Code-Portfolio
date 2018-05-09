import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { MethodsService } from '../services/methods.service';
import { CallService } from '../services/call.service';
import { Settings } from '../models/unit.model'
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-property-tree',
  templateUrl: './property-tree.component.html',
  styleUrls: ['./property-tree.component.css'],
  animations: [
    trigger('rotaterefresh', [
      state('true', style({
        transform: 'rotate(20000deg)',
        // animation: '2s rotateRight infinite linear'
      })),
      state('false',   style({
        transform: 'rotate(0deg)'
      })),
      transition('false => true', animate('200s')),
      // transition('true => false', animate('1s'))
    ])
  ]
})
export class PropertyTreeComponent implements OnInit {

  URL: string = '';
  selectedGraph: string = 'Portfolio/Benchmark';
  end_date: string;
  start_date: string;
  allocation: string[] = [];
  target_stock: string[] = [];
  first_click = true;
  plusflag: boolean = false;

  constructor(private projectService: ProjectService, private methodsService: MethodsService, private callService: CallService) {
    this.URL = "portfolio-plot";
    this.callService.flag = false;
    this.end_date = String(methodsService.settings.end_date);
    this.start_date = String(methodsService.settings.start_date);
    this.methodsService.settings.allocation.forEach(all => {
      this.allocation.push(String(all));
    });
    this.methodsService.settings.target_stocks.forEach(target => {
      this.target_stock.push(target);
    });
  }

  ngOnInit() {

  }

  onSubmit() {
    this.callService.flag = true;
    this.first_click = false;
    this.methodsService.settings.allocation = [];
    this.methodsService.settings.target_stocks = [];
    this.allocation.forEach(all => {
      this.methodsService.settings.allocation.push(Number(all));
    });
    this.target_stock.forEach(target => {
      this.methodsService.settings.target_stocks.push(target);
    });
    let startDate = new Date(this.start_date)
    this.methodsService.settings.start_date = [startDate.getFullYear(), startDate.getMonth()+1, startDate.getDate()];
    let endDate = new Date(this.end_date)
    this.methodsService.settings.end_date = [endDate.getFullYear(), endDate.getMonth()+1, endDate.getDate()];
    this.methodsService.settings.start_value = Number(this.methodsService.settings.start_value);
    console.log(this.methodsService.settings);
  	this.projectService.postForm(this.URL, this.methodsService.settings);
  }

  onChangeRatio(event, index) {
    event.preventDefault();
    this.methodsService.settings.allocation[index] = event.target.value;
  }

  plusClick() {
    this.allocation.push('0');
    this.target_stock.push('');
  }

  minusClick(index: number) {
    this.allocation.splice(index, 1);
    this.target_stock.splice(index, 1);
  }

  onPortfolioVsBenchmark() {
    this.plusflag = false;
    this.selectedGraph = "Portfolio/Benchmark";
    this.URL = "portfolio-plot";
  }

  onValueComparison() {
    this.plusflag = false;
    this.selectedGraph = 'Value Comparison';
    this.URL = "value-plot";
  }

  onRuleBasedComputation() {
    this.plusflag = true;
    this.allocation.splice(1, this.allocation.length-1);
    this.allocation[0] = '1';
    this.target_stock.splice(1, this.target_stock.length-1);
    this.selectedGraph = "Rule Based Computation";
    this.URL = "rule-based-plot";
  }

  onTreeBasedLearner() {
    this.plusflag = true;
    this.allocation.splice(1, this.allocation.length-1);
    this.allocation[0] = '1';
    this.target_stock.splice(1, this.target_stock.length-1);
    this.selectedGraph = "Tree Based Learner";
    this.URL = "tree-based-plot";
  }

  onReinforcementLearner() {
    this.plusflag = true;
    this.allocation.splice(1, this.allocation.length-1);
    this.allocation[0] = '1';
    this.target_stock.splice(1, this.target_stock.length-1);
    this.selectedGraph = "Reinforcement Learner";
    this.URL = "reinforcement-plot";
  }

}
