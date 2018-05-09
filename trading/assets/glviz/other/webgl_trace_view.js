/**
 * Keysight Confidential
 * Copyright Keysight Technologies
 *
 * @module WebTraceView
 * rendering a set of plots in a single coordinate, also including the title, the axis and those markers.
 */

/** Usage of WebTraceView:
 *
 * 1. new WebGlTraceView(twgl, canvas, hud, ctx);
 * 2. must do: InitTraceController();  InitMarkerController();
 * 3. then you can do: getTraceController(), adding and deleting traces to the trace_controller;
 * 4. also you can do: getMarkerController(), adding and deleting markers to the marker_controller;
 * 5. must do: before rendering, setXAxisMax(), setXAxisMin(), setYAxisMax(),setYAxisMin();
 * 6. also you can do: setFont('marker',25 ,'arial'); setFont('axis',25 ,'arial'); the font is by default 15 px and arial.
 * 7. render()
 *
 */
module.exports =
{
  WebGlTraceView: function(twgl, canvas, hud, ctx) {

      var GD = require('../drawers/griddrawer.js');
      var BD = require('../drawers/bounddrawer.js');
      var XA = require('./x_axis.js');
      var YA = require('./y_axis.js');
      var TXD = require('../drawers/textdrawer.js');
      var TC = require('../controllers/tracecontroller.js');
      var MC = require('../controllers/MarkerController.js');
      var LD = require('../drawers/linedrawer.js');
      var PT = require('./plotType.js');

      this.gl = twgl.getWebGLContext(canvas);                                      /// Initializing
      this.ctx = ctx;
      this.H_step = 16;
      this.line_drawer = new LD.LineDrawer(twgl, canvas);
      this.grid_drawer = new GD.GridDrawer(twgl, canvas);
      this.boundary_drawer = new BD.BoundDrawer(twgl, canvas);
      this.x_axis = new XA.X_Axis(ctx);
      this.y_axis = new YA.Y_Axis(ctx);
      this.plotType = PT.PlotType;
      this.fontsize_axis_title = 14;
      this.fonttype_axis_title = 'arial';
      this.fontsize_marker = 14;
      this.fonttype_marker = 'arial';
      this.marker_controller = null;
      this.boundary = {};
      this.plot = 0;
      this.IQlabels = false;
      this.plotNum = 1;
      this.legend = [];
      this.legend_drawer = null;

      this.setPlot = function (number) {
          this.plot = number;
      }

      this.setLegend = function (legend){
          this.legend = legend;
          this.yH -= this.H_step;
          this.setWebGLViewport(this.x0,this.y0,this.xW,this.yH);
          this.legend_drawer = new TXD.TextDrawer(hud, ctx);
      }

    //   this.setIQlabels = function (txt) {
    //       if (this.plot === this.plotType.IorQ) {
    //           this.IQlabels_drawer = new TXD.TextDrawer(hud, ctx);
    //           this.IQlabels_drawer.setText(txt);
    //       }
    //   }

      this.InitTraceController = function() {
          this.trace_controller = new TC.TraceController();
      };

      this.InitMarkerController = function() {
          this.marker_controller = new MC.MarkerController(twgl, canvas, hud, ctx);
      }

      this.setWebGLViewport = function(x0,y0,xW,yH){
          this.x0 = x0;
          this.y0 = y0;
          this.xW = xW;
          this.yH = yH;
          this.marker_controller.setRectangleInit(this.getRectangle(),this.H_step);
      }

      this.getTraceController = function() {
          return this.trace_controller;
      }

      this.getMarkerController = function() {
          return this.marker_controller;
      }

      this.setMarkerFont = function (size, type) {
          this.fontsize_marker = size;
          this.fonttype_marker = type;
      }

      this.setAxisTitleFont = function (size, type) {
          this.fontsize_axis_title = size;
          this.fonttype_axis_title = type;
      }

      this.getRectangle = function(){
          var rect = { left: this.x0, right: this.x0+this.xW, top: this.gl.canvas.height-(this.y0+this.yH), bottom: this.gl.canvas.height-this.y0 };
          return rect;
      }

      this.setRectangle = function(r){
          this.x0 = r.left;
          this.xW = r.right - r.left;
          this.y0 = this.gl.canvas.height - r.bottom;
          this.yH = r.bottom - r.top;
      }

      this.setXAxisMax = function(v) {
          this.x_axis.setMaxVal(v);
      };
      this.setYAxisMax = function(v) {
          this.y_axis.setMaxVal(v);
      };
      this.setXAxisMin = function(v) {
          this.x_axis.setMinVal(v);
      };
      this.setYAxisMin = function(v) {
          this.y_axis.setMinVal(v);
      };

      this.switchPlot = function (n) {
        this.x_axis.setUnits('Days');        
        if (n === this.plotType.ValueComparison) {
            this.x_axis.setPlotType(this.plotType.ValueComparison);
            this.y_axis.setPlotType(this.plotType.ValueComparison);
            this.y_axis.setUnits('%');
        } else {
            this.x_axis.setPlotType(this.plotType.Portfolio);
            this.y_axis.setPlotType(this.plotType.Portfolio);            
            this.y_axis.setUnits('$');
        }
      }

      // If the stepSize is decimal and larger than 1, make it to be the ceiling integer.
      this.scaleStepSize = function (plottype) {
          if (plottype !== this.plotType.Portfolio && plottype !== this.plotType.ValueComparison) {
            this.boundary.minY = Math.floor(this.trace_controller.Yrange.min);
            this.boundary.maxY = 2;
            this.boundary.stepY = 1;
          } else {              
              var stepY = (this.trace_controller.Yrange.max - this.trace_controller.Yrange.min) / 10;
              if (stepY > 1) {
                  stepY = Math.ceil(stepY);
                  this.boundary.maxY = this.trace_controller.Yrange.max;
                  this.boundary.minY = this.boundary.maxY - 10 * stepY;
                  this.boundary.stepY = stepY;
              } else {
                  this.boundary.minY = this.trace_controller.Yrange.min;
                  this.boundary.maxY = this.trace_controller.Yrange.max;
                  this.boundary.stepY = stepY;
              }
          }
        //    this.boundary.minY = 0.0;
        //   this.boundary.maxY = 252.0;
        //    this.boundary.stepY = 1.0;
          return this.boundary;
      }

      this.setXAxisData = function(dates) {
        var xsteps = (this.grid_drawer.grid_bounds_x[1] - this.grid_drawer.grid_bounds_x[0]) / this.grid_drawer.grid_step_x;
        this.x_axis.setDivision(xsteps);
        this.x_axis.setUnitData(dates);
      };

    //   this.makeCCDFlogScale = function (value,fakeinfinity) {
    //       var stepnum = this.grid_drawer.setForCCDF(Math.pow(10,Math.floor(value)));
    //       this.y_axis.setCCDF(this.plotType.WaveformCCDF,stepnum);
    //       var xsteps = (this.grid_drawer.grid_bounds_x[1] - this.grid_drawer.grid_bounds_x[0]) / this.grid_drawer.grid_step_x;
    //       this.x_axis.setDivision(xsteps);
    //       this.marker_controller.setLogY(true,fakeinfinity,Math.floor(value) - 2);
    //   }

      this.setPlotNum = function(num) {
          this.grid_drawer.setPlotNum(num);
          this.boundary_drawer.setPlotNum(num);
      }

      this.render = function() {
          // updating the rectangle according to the markercontroller
          if(this.marker_controller != null) {
              this.setRectangle(this.marker_controller.rect);
          }
          this.gl.viewport(this.x0, this.y0, this.xW, this.yH);
          this.gl.scissor(this.x0, this.y0, this.xW, this.yH);

          // First, draw grid and boundary.
          const rect = this.getRectangle();
          this.grid_drawer.setPattern('dotted');
          this.grid_drawer.createGrid();
          this.boundary_drawer.setPattern('default');
          this.boundary_drawer.render();

          this.x_axis.setGridRectangle(rect);
          this.y_axis.setGridRectangle(rect);
          if (this.trace_controller.traces.length == 0) {
              this.x_axis.setMaxVal(100);
              this.x_axis.setMinVal(0);
              this.y_axis.setMaxVal(100);
              this.y_axis.setMinVal(0);
              this.setPlot(this.plotType.Portfolio);
          } else {
              /// draw traces
              this.trace_controller.setLinedrawer(this.line_drawer);
              this.trace_controller.render();

              // draw markers
              if(this.marker_controller != null) {                                         /// draw markers
                  this.marker_controller.setAxis(this.x_axis.min,this.x_axis.max,this.y_axis.min,this.y_axis.max);
                  this.marker_controller.setFont(this.fontsize_marker,this.fonttype_marker);
                  this.marker_controller.setPlot(this.plot);
                  this.marker_controller.render();
              }
          }
          this.switchPlot(this.plot);
          this.x_axis.setFont(this.fontsize_axis_title,this.fonttype_axis_title);
          this.x_axis.render();
          this.y_axis.setFont(this.fontsize_axis_title,this.fonttype_axis_title);
          this.y_axis.render();

        //   this.renderPeakPower(rect);

          if (this.legend_drawer != null) {
              var legend_length = 0;
              for (var i = 0; i < this.legend.length; i++) {
                  this.legend_drawer.setText(this.legend[i] + "   ");
                  this.legend_drawer.setCoord(rect.left + legend_length, rect.top - this.H_step * 0.5);
                  this.legend_drawer.setTextColor(this.trace_controller.traces[i].line_color);
                  this.legend_drawer.render();
                  legend_length += this.legend_drawer.getTextWidth();
              }
          }
    };
  }
};
