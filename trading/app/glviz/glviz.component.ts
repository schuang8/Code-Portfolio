import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentInit, ViewChild, Input, OnChanges, ElementRef} from '@angular/core';
import twgl from 'twgl.js';
import { WebGlTraceViewController } from '../../assets/glviz/controllers/WebTraceViewController.js';
import { Trace } from '../../assets/glviz/other/trace.js';
import { WindowResizeService, WindowParameters } from '../services/window-resize.service';
import { isUndefined } from 'util';
import { PlotType } from '../../assets/glviz/other/plotType.js';
import { ProjectService } from '../services/project.service';

export interface PreviousCanvasSetting {
  width: number;
  height: number;
}

@Component({
  selector: 'app-glviz',
  templateUrl: './glviz.component.html',
  styleUrls: ['./glviz.component.css']
})
export class GlvizComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges, AfterContentInit {

  //private ngUnsubscribe: Subject<void> = new Subject<void>();  // Data Subscriber?
  private intervalId;  
  private webglTraceView_Controller;
  private plotType;
  @Input() selectedGraph: string;

  public variables = {
    BMcachedDataArray: { indices: [], time: [], price: [], markerX: [], markerY: [] },
    PFcachedDataArray: { indices: [], time: [], price: [], markerX: [], markerY: [] },
    SDcachedDataArray: [],
    stocks: [], // String[]
    xscale: 0,
    yscale: 1,
    xtrans: 0.0,
    ytrans: 0.0,
    defaultFontSize: 24,
    currentFontSize: 24,
    currentXAxisMax: 0,
    currentYAxisMax: 0,
    currentXAxisMin: 0,
    currentYAxisMin: 0,
    DPRServiceValue: 1
  };

  public tooltiptext;  

  @ViewChild('myCanvas') thisCanvas;
  @ViewChild('myOverlay') thisOverlay;

  previousCanvasSetting: PreviousCanvasSetting = {
    width: 0,
    height: 0
  };

  constructor(
    private el: ElementRef,    
    private windowResizeService: WindowResizeService,
    private projectService: ProjectService
  ) { 
  }

  ngOnChanges() {
    this.setCanvasResolution();
  }

  ngOnInit() {
  } 

  ngAfterViewInit() {
    this.windowResizeService.onWindowResize$
    .subscribe((onWindowResize: WindowParameters) => {
        this.variables.DPRServiceValue = onWindowResize.ratio;
        this.doRender(this.variables);
    });
    this.projectService.currentPlotData.subscribe(rsp => {
      console.log(this.selectedGraph);
      this.resolvePlotType(this.selectedGraph);
      this.setStockData(JSON.parse(rsp));
      this.setCanvasResolution();
    });
  }

  ngAfterContentInit() {
    this.intervalId = setInterval(() => {
        if (this.el.nativeElement.children.length) {
            const h = this.el.nativeElement.children[0].offsetHeight;
            const w = this.el.nativeElement.children[0].offsetWidth;
            if ((h !== this.previousCanvasSetting.height) || (w !== this.previousCanvasSetting.width)) {
                this.previousCanvasSetting = {
                    width: w,
                    height: h
                };
                this.setCanvasResolution();
            }
        }
    }, 100);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    // this.ngUnsubscribe.next();
    // this.ngUnsubscribe.complete();
  }

  setCanvasResolution(event?: Event) {
    const canvas = this.thisCanvas.nativeElement;
    const overlay = this.thisOverlay.nativeElement;

    //  Actual display size.
    const displayWidth = canvas.clientWidth * (window.devicePixelRatio || 1);
    const displayHeight = canvas.clientHeight * (window.devicePixelRatio || 1);

    //  Ensure canvas resolution is twice the physical size (for HDPI)
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        overlay.width = displayWidth;
        overlay.height = displayHeight;
    }

    // When window is resized, re-render plots.
    this.doRender(this.variables);
  }

  resolvePlotType(plotType) {
    if (plotType === 'Portfolio/Benchmark') {
      this.plotType = PlotType.Portfolio;
    } else if (plotType === 'Value Comparison') {
      this.plotType = PlotType.ValueComparison;
    } else if (plotType == 'Rule Based Computation') {
      this.plotType = PlotType.Portfolio;
    } else if (plotType == 'Tree Based Learner') {
      this.plotType = PlotType.Portfolio;
    } else if (plotType == 'Reinforcement Learner') {
      this.plotType = PlotType.Portfolio;
    }
  }

  setStockData(dataArray) {
    console.log(dataArray);
    if (this.plotType === PlotType.Portfolio) {
      
      var benchmarks = [];
      var portfolios = [];
      var dates = Object.keys(dataArray);
      console.log(dates[0]);
      console.log(Date.parse(dates[0]));
      var month = new Date(dates[0]);
      console.log(month.getDay());
      for (var date in dataArray) {
        benchmarks.push(dataArray[date]['Benchmark']);
        portfolios.push(dataArray[date]['Portfolio']);
      }

      var xarray = [];
      for (var i = 0; i < dates.length; i++) {
        xarray.push(i);
        
      }

      this.variables.BMcachedDataArray.indices = xarray;
      this.variables.BMcachedDataArray.time = dates;
      this.variables.BMcachedDataArray.price = benchmarks;
      this.variables.PFcachedDataArray.indices = xarray;
      this.variables.PFcachedDataArray.time = dates;
      this.variables.PFcachedDataArray.price = portfolios;

      this.variables.xscale = 2*(1/(dates.length-1));
    } else if (this.plotType === PlotType.ValueComparison) {
      this.variables.SDcachedDataArray = [];
      var times = Object.keys(dataArray);
      if (!isUndefined(times[0])) {
        this.variables.stocks = Object.keys(dataArray[times[0]]);
      }
      var indices = [];
      for (var i = 0; i < times.length; i++) {
        indices.push(i);
      }

      for (var i = 0; i < this.variables.stocks.length; i++) {
        var dataStruct = {stock: "", indices: [], time: [], percentage: [] }
        dataStruct.stock = this.variables.stocks[i];
        dataStruct.indices = indices;
        dataStruct.time = times;
        for (var date in dataArray) {
          dataStruct.percentage.push(100*(dataArray[date][dataStruct.stock]));
        }
        this.variables.SDcachedDataArray.push(dataStruct);
      }

      this.variables.xscale = 2*(1/(times.length-1));   
    }
    
  }

  setTooltipPosition(event: MouseEvent, mytooltip) {
    const ancestor_inner_container = this.thisCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    const ancestor_outer_container = ancestor_inner_container.parentNode;
    const height_margin = (ancestor_outer_container.clientHeight - ancestor_inner_container.clientHeight) / 2;
    const width_margin = (ancestor_outer_container.clientWidth - ancestor_inner_container.clientWidth) / 2;
    const offset = 32 + 34 + 56 + height_margin + ancestor_inner_container.clientHeight - this.thisCanvas.nativeElement.clientHeight;
    const clientwidth = this.thisCanvas.nativeElement.clientWidth;
    let x = event.clientX - width_margin;
    const y = event.clientY - offset;
    const value = this.getTraceDataPoint(x, y);
    if (value !== null) {
        this.tooltiptext = 'time: ' + value[0] + '  price: ' + value[1];
        if (value.length === 3) { this.tooltiptext = value[2] + '  ' + this.tooltiptext; }
        const ctx = this.thisOverlay.nativeElement.getContext('2d');
        ctx.font = '14px Roboto';
        const width = ctx.measureText(this.tooltiptext).width;
        if (x + width + 30 > clientwidth) { x = clientwidth - width - 30; }
        mytooltip.setAttribute('style', ('top: ' + y + 'px ;') + ('left: ' + x + 'px ;'));
        setTimeout(() => mytooltip.style.visibility = 'visible', 500);
    }

  }

  setTooltipHidden(mytooltip) {
    mytooltip.style.display = 'none';
  }

  getTraceDataPoint(x, y) {
    x = x * (window.devicePixelRatio || 1);
    y = y * (window.devicePixelRatio || 1);
    const wtv = this.getMouseWebglTraceView(x, y);
    if (wtv === null) { return null; }
    const value = this.TraceDataCapture(wtv, x, y);
    if (value === null) { return null; }

    switch (this.plotType) {
      case PlotType.Portfolio:
        return [value[0], '$' + value[1].toFixed(2)];
      case PlotType.ValueComparison:
        return [value[0], value[1].toFixed(2) + ' %'];
    }
    return null;
  }

  getMouseWebglTraceView(x, y) {
    if (this.webglTraceView_Controller === null) { return null; }
    const webgltraceviews = this.webglTraceView_Controller.webgltraceviews;
    const row = webgltraceviews.length;
    if (row === 0) { return null; }
    const col = webgltraceviews[0].length;
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const rect = webgltraceviews[i][j].getRectangle();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return webgltraceviews[i][j];
            }
        }
    }
    return null;
  }

  TraceDataCapture(wtv, x, y) {
    const rect = wtv.getRectangle();
    x = (x - rect.left) / (rect.right - rect.left);
    y = (rect.bottom - y) / (rect.bottom - rect.top);
    const WHratio = (rect.right - rect.left) / (rect.bottom - rect.top);
    const xmax = wtv.x_axis.max, xmin = wtv.x_axis.min;
    const ymax = wtv.y_axis.max, ymin = wtv.y_axis.min;
    const xrange = xmax - xmin;
    const yrange = ymax - ymin;
    const xvalue = xrange * x + xmin;
    const yvalue = yrange * y + ymin;
    const traces = wtv.trace_controller.traces;
    let xvals, yvals;
    let minDistance = WHratio + 1, cur = WHratio + 1, min_index = -1, min_trace = -1;

    for (let t = 0; t < traces.length; t++) {
        xvals = traces[t].xarray;
        yvals = traces[t].yarray;
        let index;
        for (index = 0; index < xvals.length; index++) {
            if (xvalue <= xvals[index]) { break; }
        }
        if (isUndefined(xvals[index]) || isUndefined(yvals[index])) { return null; }
        const R = Math.ceil(xvals.length * 0.02);
        for (let i = Math.max(index - R, 0); i < xvals.length && i <= index + R; i++) {
            cur = Math.abs(yvals[i] - yvalue) / yrange + Math.abs(xvals[i] - xvalue) / xrange * WHratio;
            if (cur < minDistance) {
                min_index = i;
                minDistance = cur;
                min_trace = t;
            }
        }
    }
    if (minDistance < 0.04) {
        xvals = traces[min_trace].xarray;
        yvals = traces[min_trace].yarray;
        return [xvals[min_index], yvals[min_index], min_trace];
    }
    return null;

  }

  setVariables(webglTraceView) {
    const tc = webglTraceView.getTraceController();
    const boundary = webglTraceView.scaleStepSize(this.plotType);
    const maxY = boundary.maxY;
    let minY = boundary.minY;

    this.variables.yscale = (2.0 / (maxY - minY));
    this.variables.xtrans = - ((tc.Xrange.max + tc.Xrange.min) * 0.5) * this.variables.xscale;
    this.variables.ytrans = - ((maxY + minY) * 0.5) * this.variables.yscale;
    //this.variables.xscale = (1/(this.variables.BMcachedDataArray.indices.length-1))*2;
    this.variables.currentXAxisMax = tc.Xrange.max;
    this.variables.currentYAxisMax = maxY;
    this.variables.currentXAxisMin = tc.Xrange.min;
    this.variables.currentYAxisMin = minY;
    webglTraceView.setXAxisMax(this.variables.currentXAxisMax);
    webglTraceView.setYAxisMax(this.variables.currentYAxisMax);
    webglTraceView.setXAxisMin(this.variables.currentXAxisMin);
    webglTraceView.setYAxisMin(this.variables.currentYAxisMin);
    tc.setScaleFactor(this.variables.xscale, this.variables.yscale, 1);
    tc.setTransFactor(this.variables.xtrans, this.variables.ytrans, 0);
  }

  deleteTrace(trace, webglTraceView) {
    const tc = webglTraceView.getTraceController();
    const mc = webglTraceView.getMarkerController();
    mc.deleteTraceUpdateMarkers(trace, tc);
    tc.deleteTrace(trace);
    this.setVariables(webglTraceView);
    tc.setScaleFactor(this.variables.xscale, this.variables.yscale, 1);
    tc.setTransFactor(this.variables.xtrans, this.variables.ytrans, 0);
    webglTraceView.setXAxisMax(this.variables.currentXAxisMax);
    webglTraceView.setYAxisMax(this.variables.currentYAxisMax);
    webglTraceView.setXAxisMin(this.variables.currentXAxisMin);
    webglTraceView.setYAxisMin(this.variables.currentYAxisMin);
    webglTraceView.render();
  }

  deleteMarker(id, webglTraceView) {
    const mc = webglTraceView.getMarkerController();
    mc.deleteMarker(id);
    webglTraceView.render();
  }

  emptyRender() {
    this.webglTraceView_Controller.addPlotView(0, 0);
    this.webglTraceView_Controller.webgltraceviews[0][0].setPlot(1);
    this.setVariables(this.webglTraceView_Controller.webgltraceviews[0][0]);
    this.webglTraceView_Controller.render();
    return;
  }

  doRender(vars) {
    vars.currentFontSize = vars.defaultFontSize * vars.DPRServiceValue;
    
    const benchmarkData = vars.BMcachedDataArray;
    const portfolioData = vars.PFcachedDataArray;
    const stocksData = vars.SDcachedDataArray;
    const stocksArr = vars.stocks;
    const stockCount = stocksArr.length;

    const canvas = this.thisCanvas.nativeElement;
    const hud: any = this.thisOverlay.nativeElement;
    const ctx = hud.getContext('2d');
    this.webglTraceView_Controller = new WebGlTraceViewController(twgl, canvas, hud, ctx, vars.currentFontSize);
    this.webglTraceView_Controller.onInit();
    if (this.plotType === PlotType.Portfolio && benchmarkData.price.length === 0 && portfolioData.price.length === 0) {
        this.emptyRender();
        return;
    }
    if (this.plotType === PlotType.ValueComparison && stocksData.length === 0) {
        this.emptyRender();
        return;
    }   

    if (this.plotType === PlotType.Portfolio) {
      const trace_benchmark = new Trace(11);
      trace_benchmark.setData(vars.BMcachedDataArray.indices, vars.BMcachedDataArray.price);
      const trace_portfolio = new Trace(12);
      trace_portfolio.setData(vars.PFcachedDataArray.indices, vars.PFcachedDataArray.price);
      this.webglTraceView_Controller.addPlotView(0, 0);
      this.webglTraceView_Controller.webgltraceviews[0][0].setLegend(['Benchmark', 'Portfolio']);
      const tc0 = this.webglTraceView_Controller.webgltraceviews[0][0].getTraceController();
      //this.webglTraceView_Controller.webgltraceviews[0][0].makeCCDFlogScale(0, false);
      this.webglTraceView_Controller.webgltraceviews[0][0].setXAxisData(benchmarkData.time);
      tc0.addTrace(trace_benchmark);     
      tc0.addTrace(trace_portfolio);
         
      this.webglTraceView_Controller.webgltraceviews[0][0].setPlot(PlotType.Portfolio);
      this.setVariables(this.webglTraceView_Controller.webgltraceviews[0][0]);
      this.webglTraceView_Controller.render();
    } else if (this.plotType === PlotType.ValueComparison) {
      const id = 21;
      var trace_stocks = [];
      for (var i = id; i < id + stockCount; i++) {
        var trace_stock = new Trace(i);
        trace_stock.setData(vars.SDcachedDataArray[i-id].indices, vars.SDcachedDataArray[i-id].percentage);
        trace_stocks.push(trace_stock);
      }
      this.webglTraceView_Controller.addPlotView(0, 0);
      this.webglTraceView_Controller.webgltraceviews[0][0].setLegend(stocksArr);
      console.log(stocksArr);               
      const tc0 = this.webglTraceView_Controller.webgltraceviews[0][0].getTraceController();
      this.webglTraceView_Controller.webgltraceviews[0][0].setXAxisData(stocksData[0].time); 
      for (var i = 0; i < trace_stocks.length; i++) {
        tc0.addTrace(trace_stocks[i]);
      }
      this.webglTraceView_Controller.webgltraceviews[0][0].setPlot(PlotType.ValueComparison);
      this.setVariables(this.webglTraceView_Controller.webgltraceviews[0][0]);
      this.webglTraceView_Controller.render();
    }

    
    }

}
