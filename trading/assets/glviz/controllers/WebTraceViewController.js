/**
 * Created by xianwu01 on 8/8/2017.
 */

/**
 *             --------------------------
 *             |                        |
 *             |        GL Canvas       |   yH
 *             |                        |
 *             *-------------------------
 *         (x0,y0)       <- xW ->
 *
 *             this.gl.viewport(this.x0, this.y0, this.xW, this.yH);
 *             this.gl.scissor(this.x0, this.y0, this.xW, this.yH);
 *             will change the gl canvas size
 *
 *             this.height and this.width are the HTML canvas' height and width, I just cut out some margin, now you know what 0.075 means.
 *             here x0 y0 xW yH is the overall GL size of all the subplots, according to the subplots' distribution,
 *             I will determine each subplot's own (x0,y0,xW,yH) value and reset the gl canvas when rendering the current subplot.
 */


module.exports = {
    WebGlTraceViewController: function (twgl, canvas, hud, ctx, OnInitFontSize) {

        var  WTV = require('../other/webgl_trace_view.js');
        this.gl = twgl.getWebGLContext(canvas);                                      /// Initializing
        this.height = this.gl.canvas.height;
        this.width = this.gl.canvas.width;
        this.fontsize = OnInitFontSize;
        this.blank_rate_width = 0.1;
        this.blank_rate_height = 0.2;
        this.webgltraceviews = [];

        this.onInit = function() {
            ctx.font = this.fontsize + "px Roboto";
            const w1 = ctx.measureText("9999.000 dB ").width;
            const w2 = ctx.measureText("0.000e-00 dB ").width;
            this.x0 = Math.max(w1,w2);
            this.y0 = this.fontsize * 3;
            if(this.width - this.x0 * 2 > 0)
                this.xW = this.width - this.x0 * 2;
            else
                this.xW = 1;
            this.yH = this.height - this.y0 - this.fontsize*2;
            this.each_plot_width = this.xW;
            this.each_plot_height = this.yH;
        };

        this.addPlotView = function(row,col){
            while(this.webgltraceviews.length <= row){
                this.webgltraceviews.push([]);
            }
            for(var i=0; i<this.webgltraceviews.length; i++){
                while(this.webgltraceviews[i].length <= col) this.webgltraceviews[i].push(null);
            }
            this.webgltraceviews[row][col] = new WTV.WebGlTraceView(twgl, canvas, hud, ctx);
            this.webgltraceviews[row][col].InitTraceController();
            this.webgltraceviews[row][col].InitMarkerController();
            ///set everyone's gl viewport
            var ROW = this.webgltraceviews.length;
            var COL = this.webgltraceviews[0].length;
            this.each_plot_width = this.xW / (COL + (COL-1)*this.blank_rate_width);
            this.each_plot_height = this.yH / (ROW + (ROW-1)*this.blank_rate_height);
            for(var i=0; i<ROW; i++){
                var cur_y0 = this.y0 + this.yH - i*(this.each_plot_height)*(1+this.blank_rate_height)  - this.each_plot_height;
                for(var j=0; j<COL; j++){
                    if(this.webgltraceviews[i][j] != null){
                        var cur_x0 = this.x0 + j*(this.each_plot_width)*(1+this.blank_rate_width);
                        this.webgltraceviews[i][j].setWebGLViewport(cur_x0,cur_y0,this.each_plot_width,this.each_plot_height);
                    }
                }
            }
        };

        this.render = function(){
            ctx.clearRect(0, 0, hud.width, hud.height);
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

            var ROW = this.webgltraceviews.length;
            if(ROW==0) return;
            var COL = this.webgltraceviews[0].length;

            for(var i=0; i<ROW; i++) {
                for (var j = 0; j < COL; j++) {
                    if (this.webgltraceviews[i][j] != null) {
                        this.webgltraceviews[i][j].setMarkerFont(this.fontsize ,'Roboto');
                        this.webgltraceviews[i][j].setAxisTitleFont(this.fontsize ,'Roboto');
                        this.webgltraceviews[i][j].render();
                    }
                }
            }
        };
    }
};
