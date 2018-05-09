module.exports = {
    GridDrawer: function(twgl, canvas) {
        // need to use "require" to import when creating a module
        const LD = require('./SDF_linedrawer.js');
        this.grid_line_drawer = new LD.SelfDefinedLineDrawer(twgl, canvas);
        this.grid_step_x = 0.20;
        this.grid_step_y = 0.20;
        this.grid_bounds_x = [-1.0, +1.0];
        this.grid_bounds_y = [-1.0, +1.0];
        this.line_pixels = 1;
        this.isForCCDF = false;
        const x0 = this.grid_bounds_x[0];
        const x1 = this.grid_bounds_x[1];
        const y0 = this.grid_bounds_y[0];
        const y1 = this.grid_bounds_y[1];
        this.grid_dash_size_x = 20;
        this.grid_gap_size_x = 15;
        this.grid_dash_size_y = 20;
        this.grid_gap_size_y = 15;
        this.plotNum = 1;
        this.pattern = 'default';

        this.setPattern = function (pattern) {
            this.pattern = pattern;
            if (this.pattern == 'dotted') {
                this.line_pixels = 4;
            }
        }

        this.setPlotNum = function(num) {
            this.plotNum = num;
        };

        // draw the grid
        this.createGrid = function() {
            this.grid_line_drawer.setColor([88 / 255, 88 / 255, 88 / 255, 1.0]);
            // pixels along different axises are the same.
            // line_width_x / 2.0 * canvas.height = line_width_y / 2.0 * canvas.width = line_pixels
            const line_width_x = this.line_pixels / (canvas.height / this.plotNum) * 2.0;
            const line_width_y = this.line_pixels / (canvas.width) * 2.0;
            if (this.pattern === 'default') {
                // draw grids paralleled with y-axis
                for (var x = x0 + this.grid_step_x; x < x1; x += this.grid_step_x) {
                    this.grid_line_drawer.setAttri(y1 - y0, line_width_y);
                    this.grid_line_drawer.setPoint(x, y1);
                    this.grid_line_drawer.render();
                }
                // draw grids paralleled with x-axis
                for (var y = y0 + this.grid_step_y; y < y1; y += this.grid_step_y) {
                    this.grid_line_drawer.setAttri(line_width_x, x1 - x0);
                    this.grid_line_drawer.setPoint(x0, y);
                    this.grid_line_drawer.render();
                }
            } else if (this.pattern === 'dash') {
                this.grid_line_drawer.setColor([88 / 255, 88 / 255, 88 / 255, 1.0]);
                // draw grids paralleled with y-axis
                for (var x = x0 + this.grid_step_x; x < x1; x += this.grid_step_x) {
                    this.grid_line_drawer.setAttri(y1 - y0, line_width_y);
                    this.grid_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                    this.grid_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_y);
                    this.grid_line_drawer.setLineDrawerDashSize(this.grid_dash_size_y);
                    this.grid_line_drawer.setPointWithTextureCoords(x, y1, 1.0, true);
                    this.grid_line_drawer.render();
                }
                // draw grids paralleled with x-axis
                for (var y = y0 + this.grid_step_y; y < y1; y += this.grid_step_y) {
                    this.grid_line_drawer.setAttri(line_width_x, x1 - x0);
                    this.grid_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                    this.grid_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_x);
                    this.grid_line_drawer.setLineDrawerDashSize(this.grid_dash_size_x);
                    this.grid_line_drawer.setPointWithTextureCoords(x0, y, 1.0, false);
                    this.grid_line_drawer.render();
                }
            } else if (this.pattern === 'dotted') {
                this.grid_line_drawer.setPattern('dotted');
                // draw grids paralleled with y-axis
                for (var x = x0 + this.grid_step_x; x < x1; x += this.grid_step_x) {
                    this.grid_line_drawer.setAttri(y1 - y0, line_width_y);
                    this.grid_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                    this.grid_line_drawer.setPointWithTextureCoords(x, y1, 1.0, true);
                    this.grid_line_drawer.render();
                }
                // draw grids paralleled with x-axis
                for (var y = y0 + this.grid_step_y; y < y1; y += this.grid_step_y) {
                    this.grid_line_drawer.setAttri(line_width_x, x1 - x0);
                    this.grid_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                    this.grid_line_drawer.setPointWithTextureCoords(x0, y, 1.0, false);
                    this.grid_line_drawer.render();
                }
            }
        };

        this.setGridStep = function (direction, value) {
            if (direction === 'x')
                this.grid_step_x = value;
            else
                this.grid_step_y = value;
        }

        this.setForCCDF = function (smallestValueOfCCDMdata) {
            this.isForCCDF = true;
            var tmplog = Math.log10(smallestValueOfCCDMdata);
            var tmpexp = Math.floor(tmplog);
            var rs = 2 - tmpexp;
            var step = 2.0 / rs;

            this.setGridStep('y', step);
            this.createGrid();
            return rs;
        }
  }
};
