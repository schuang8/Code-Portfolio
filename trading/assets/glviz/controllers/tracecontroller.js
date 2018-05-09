module.exports =
    {
        TraceController: function () {
            const CD = require('../other/colors.js');
            const colors = new CD.Colors().colors;
            this.line_drawer;
            this.traces = [];
            this.Xrange = [];
            this.Yrange = [];
            var xscale, yscale, zscale, xtrans, ytrans, ztrans;

            this.setLinedrawer = function (linedrawer) {
                this.line_drawer = linedrawer;
            }

            this.addTrace = function(trace)
            {
                trace.line_color = colors[this.traces.length];
                this.traces.push(trace);
                if(this.Xrange.length == 0) {
                    this.Xrange = {min: trace.minX, max: trace.maxX};
                    this.Yrange = {min: trace.minY, max: trace.maxY };
                }
                // update the min/max bounds and notify traces
                this.Xrange.min = Math.min(this.Xrange.min, trace.minX);
                this.Yrange.min = Math.min(this.Yrange.min, trace.minY);
                this.Xrange.max = Math.max(this.Xrange.max, trace.maxX);
                this.Yrange.max = Math.max(this.Yrange.max, trace.maxY);
                console.log(trace);
            }

            this.deleteTrace = function (trace) {
                var index;
                for (var i = 0; i < this.traces.length; i++) {
                    if (this.traces[i].id == trace.id) {
                        index = i;
                        break;
                    }
                }
                if (index == this.traces.length) return;
                this.traces.splice(index, 1);
                for (var i = 0; i < this.traces.length; i++) {
                    this.traces[i].line_color = colors[i];
                }
                if (this.traces.length == 0) {
                    this.Xrange = [];
                    this.Yrange = [];
                } else {
                    this.Xrange = {min: this.traces[0].minX, max: this.traces[0].maxX};
                    this.Yrange = {min: this.traces[0].minY, max: this.traces[0].maxY };
                    for (var i = 1; i < this.traces.length; i++) {
                        this.Xrange.min = Math.min(this.Xrange.min,this.traces[i].minX);
                        this.Yrange.min = Math.min(this.Yrange.min, this.traces[i].minY);
                        this.Xrange.max = Math.max(this.Xrange.max, this.traces[i].maxX);
                        this.Yrange.max = Math.max(this.Yrange.max, this.traces[i].maxY);
                    }
                }
            }

            this.setScaleFactor = function(xfac, yfac, zfac) {
                xscale = xfac;
                yscale = yfac;
                zscale = zfac;
            }
            this.setTransFactor = function(xtra,ytra,ztra){
                xtrans = xtra;
                ytrans = ytra;
                ztrans = ztra;
            }

            this.render = function() {
                for (var i = 0; i < this.traces.length; i++) {
                    var trace = this.traces[i];
                    this.line_drawer.setData(trace.xarray, trace.yarray);
                    this.line_drawer.line_color = trace.line_color;
                    this.line_drawer.setScale(xscale,yscale,zscale);
                    this.line_drawer.setTrans(xtrans,ytrans,ztrans);
                    this.line_drawer.render();
                }
            }
        }
    };

