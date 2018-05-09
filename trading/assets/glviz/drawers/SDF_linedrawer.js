/**
 * Created by shihanbi on 6/30/2017.
 */
module.exports = {
  // Define length and width line by your self
  SelfDefinedLineDrawer: function(twgl, canvas) {
    const LD = require('./linedrawer_dash.js');
    this.line_drawer = new LD.LineDrawer(twgl, canvas);
    const dottedLD = require('./linedrawer_dotted.js');
    this.line_drawer_dotted = new dottedLD.LineDrawer(twgl, canvas);
    this.gl = this.line_drawer.gl;
    this.arrays = {};
    this.xyzdata = new Array(12).fill(0.0);
    this.pattern = 'default';

    this.setPattern = function (pattern) {
        this.pattern = pattern;
    }

    this.setColor = function (c) {
      this.line_drawer.line_color = c;
    }

    this.setAttri = function (w, l) {
      this.line_width = w;
      this.line_length = l;
    }

    // set point to buffer. Drawing non-dashed line.
    this.setPoint = function(xdata, ydata) {
        this.setPointWithTextureCoords(xdata, ydata, 0.0, false);
    };

    // set dash size for dashed grid. Default gap size is canvas width, i.e. no dashed line
    this.setLineDrawerGridCanvasSize = function(size) {
        this.line_drawer.setGridCanvasSize(size);
        if (this.pattern === 'dotted') {
            this.line_drawer_dotted.setGridCanvasSize(size);
        }
    };

    // set gap size for dashed grid. Default gap size is 0
    this.setLineDrawerGridGapSize = function(size) {
      this.line_drawer.setGapSize(size);
    };

    this.setLineDrawerDashSize = function(size) {
      this.line_drawer.setDashSize(size);
    };

    // if you want to draw dashed lines, set textureID equal to 1, if normal lines, set as 0;
    this.setPointWithTextureCoords = function(xdata, ydata, textureID, isVertical) {
        // top-left point
        this.xyzdata[0] = xdata;
        this.xyzdata[1] = ydata;
        // bottom-left point
        this.xyzdata[3] = xdata;
        this.xyzdata[4] = ydata - this.line_width;
        // bottom-right point
        this.xyzdata[6] = xdata + this.line_length;
        this.xyzdata[7] = ydata - this.line_width;
        // top-right point
        this.xyzdata[9] = xdata + this.line_length;
        this.xyzdata[10] = ydata;

        // assign the texture coords
        if (isVertical) {
            this.xyzdata[2] = -1.0;
            this.xyzdata[5] = textureID;
            this.xyzdata[8] = textureID;
            this.xyzdata[11] = -1.0;
        } else {
            this.xyzdata[2] = -1.0;
            this.xyzdata[5] = -1.0;
            this.xyzdata[8] = textureID;
            this.xyzdata[11] = textureID;
        }

        if (this.pattern === 'dotted') {
            this.line_drawer_dotted.storeData(this.xyzdata, isVertical);
        }
        const indice = [3, 2, 1, 3, 1, 0];
        this.arrays = {point: this.xyzdata, indices: indice};
    };

    this.render = function() {
        if (this.pattern === 'dotted') {
            this.line_drawer_dotted.line_mode = this.gl.TRIANGLES;
            this.line_drawer_dotted.myBuffer = twgl.createBufferInfoFromArrays(this.gl, this.arrays);
            this.gl = this.line_drawer_dotted.gl;
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.line_drawer_dotted.render();
            this.gl.disable(this.gl.BLEND);
        } else {
            this.line_drawer.line_mode = this.gl.TRIANGLES;
            this.line_drawer.myBuffer = twgl.createBufferInfoFromArrays(this.gl, this.arrays);
            // Dashed line effect requires GL_Blend enabled.
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.line_drawer.render();
            this.gl.disable(this.gl.BLEND);
        }
    };
  }
};
