/**
 * Created by Alex Wang on 10/09/2017.
 */
module.exports = {
  // Define length and width line by your self
  SelfDefinedLineDrawer: function(twgl, canvas) {
    const LD = require('./dotsdrawer.js');
    this.line_drawer = new LD.LineDrawer(twgl, canvas);
    this.gl = this.line_drawer.gl;
    this.arrays = {};
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
    this.setLineDrawerGridDrawVertical = function(isVertical) {
      this.line_drawer.setGridDrawVertical(isVertical);
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
      this.xyzdata = [
        xdata, ydata, 0.0,
        xdata, ydata - this.line_width, 0.0,
        xdata + this.line_length, ydata - this.line_width, 0.0,
        xdata + this.line_length, ydata, 0.0
      ]
      this.texCoords = new Array(8).fill(0.0);
      if (isVertical) {
        this.texCoords = [
          0.0,0.0,
          textureID,0.0,
          textureID,1.0,
          0.0,1.0
        ]
      } else {
        this.texCoords = [
          0.0,1.0,
          0.0,0.0,
          textureID,0.0,
          textureID,1.0
        ]
      }
      const indice = [3, 2, 1, 3, 1, 0];
      this.arrays = {position: this.xyzdata, texcoord: this.texCoords, indices: indice};
    };

    this.setLineDrawerDotPoints = function(xArray, yArray, size){
      this.line_drawer.setDotSize(size);
      this.line_drawer.setData(xArray, yArray);
    }

    this.render = function() {
      // Dashed line effect requires GL_Blend enabled.
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.line_drawer.render();
      this.gl.disable(this.gl.BLEND);
    };
  }
};
