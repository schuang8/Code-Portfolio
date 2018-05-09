/**
 * Created by shihanbi on 7/13/2017.
 */
module.exports = {
    BoundDrawer: function (twgl, canvas) {
        const SDF = require('./SDF_linedrawer.js');
        this.boundary_line_drawer = new SDF.SelfDefinedLineDrawer(twgl,canvas);
        const GD = require('./griddrawer.js');
        const grid_drawer = new GD.GridDrawer(twgl, canvas);
        const line_length_y = grid_drawer.grid_bounds_y[1] - grid_drawer.grid_bounds_y[0];
        const line_length_x= grid_drawer.grid_bounds_x[1] - grid_drawer.grid_bounds_x[0];
        this.plotNum = 1;
        this.line_pixels = 2;
        this.grid_dash_size_x = 20;
        this.grid_gap_size_x = 15;
        this.grid_dash_size_y = 20;
        this.grid_gap_size_y = 15;
        this.pattern = 'default';

        this.setPattern = function (pattern) {
            this.pattern = pattern;
            if (this.pattern == 'dotted') {
                this.line_pixels = 4;
            }
        }

        this.setPlotNum = function (num) {
            this.plotNum = num;
        }

        this.render = function() {
            const line_width_x = this.line_pixels / (canvas.height / this.plotNum) * 2.0;
            const line_width_y = this.line_pixels / (canvas.width) * 2.0;
            if (this.pattern === 'default') {
                this.boundary_line_drawer.setColor([88 / 255, 88 / 255, 88 / 255, 1.0]);
                // top line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setPoint(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1]);
                this.boundary_line_drawer.render();
                // bottom line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setPoint(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[0] + line_width_x);
                this.boundary_line_drawer.render();
                // left line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setPoint(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1]);
                this.boundary_line_drawer.render();
                // right line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setPoint(grid_drawer.grid_bounds_x[1] - line_width_y, grid_drawer.grid_bounds_y[1]);
                this.boundary_line_drawer.render();
            } else if (this.pattern === 'dash') {
                this.boundary_line_drawer.setColor([88 / 255, 88 / 255, 88 / 255, 1.0]);
                // top line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                this.boundary_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_x);
                this.boundary_line_drawer.setLineDrawerDashSize(this.grid_dash_size_x);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1], 1.0, false);
                this.boundary_line_drawer.render();
                // bottom line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                this.boundary_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_x);
                this.boundary_line_drawer.setLineDrawerDashSize(this.grid_dash_size_x);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[0] + line_width_x, 1.0, false);
                this.boundary_line_drawer.render();
                // left line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                this.boundary_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_y);
                this.boundary_line_drawer.setLineDrawerDashSize(this.grid_dash_size_y);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1], 1.0, true);
                this.boundary_line_drawer.render();
                // right line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                this.boundary_line_drawer.setLineDrawerGridGapSize(this.grid_gap_size_y);
                this.boundary_line_drawer.setLineDrawerDashSize(this.grid_dash_size_y);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[1] - line_width_y, grid_drawer.grid_bounds_y[1], 1.0, true);
                this.boundary_line_drawer.render();
            } else if (this.pattern === 'dotted') {
                this.boundary_line_drawer.setPattern('dotted');
                // top line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1], 1.0, false);
                this.boundary_line_drawer.render();
                // bottom line
                this.boundary_line_drawer.setAttri(line_width_x, line_length_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.height);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[0] + line_width_x, 1.0, false);
                this.boundary_line_drawer.render();
                // left line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[0], grid_drawer.grid_bounds_y[1], 1.0, true);
                this.boundary_line_drawer.render();
                // right line
                this.boundary_line_drawer.setAttri(line_length_x, line_width_y);
                this.boundary_line_drawer.setLineDrawerGridCanvasSize(canvas.width);
                this.boundary_line_drawer.setPointWithTextureCoords(grid_drawer.grid_bounds_x[1] - line_width_y, grid_drawer.grid_bounds_y[1], 1.0, true);
                this.boundary_line_drawer.render();
            }
        }
    }
}
