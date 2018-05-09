module.exports =
{
    X_Axis: function (ctx)
    {
        var PT = require('./plotType.js');
        this.min = [];
        this.max = [];
        this.units = '';
        this.units_coord = [0,0]; // where to draw units label
        this.grid_rectangle;
        this.ctx = ctx;
        this.font = "14px arial";
        this.fontsize = 14;
        this.headText = "";
        this.tailText = "";
        this.plotType = PT.PlotType.Spectrum;
        this.digits = 3;
        this.startDate = "";
        this.endDate = "";
        this.dateData = [];

        this.setPlotType = function (type) {
            this.plotType = type;
            if(this.plotType === PT.PlotType.IorQ || this.plotType === PT.PlotType.IandQ || this.plotType === PT.PlotType.Power) this.digits = 0;
        }

        this.setDivision = function (step) {
            this.numOfDivisions = step;
        }

        this.setGridRectangle = function(rectangle)
        {
            this.grid_rectangle = rectangle;
        }

        this.setFont = function(size,type)
        {
            this.font = size+"px "+type;
            this.fontsize = size;
        }

        this.setMinVal = function(minVal) { this.min = minVal; };

        this.setMaxVal = function(maxVal) { this.max = maxVal; };

        this.setUnits = function(units) {
            this.units = units;
        };

        this.setHead = function (head) { this.headText = head; };

        this.setTail = function (tail) { this.tailText = tail; };

        this.setUnitData = function(data) {
            this.startDate = data[0];
            this.endDate = data[data.length - 1];
            this.dateData = data;
        }

        this.render = function() {

            const xPos0 = this.grid_rectangle.left;
            const xPos1 = this.grid_rectangle.right;
            const yPos  = this.grid_rectangle.bottom + 1.5 * this.fontsize;

            this.ctx.font = this.font;
            this.ctx.fillStyle = "#FFFFFF";

            //const hText = this.headText + ' ' + Number(this.min).toFixed(this.digits) + ' ' + this.units;
            const hText = this.startDate;
            this.ctx.textAlign = "left";
            this.ctx.textAlign = "center";
            this.ctx.fillText(hText, xPos0, yPos);

            // add labels for x axis divisions
            var gap = 0;
                //var labelwidth = this.ctx.measureText(this.max.toFixed(3) + ' ' + this.units).width;
                var labelwidth = this.ctx.measureText(this.startDate).width;
                var gridwidth = (xPos1 - xPos0)/this.numOfDivisions;
                var labelend = xPos0 + labelwidth;
                var curstart = xPos0 + gridwidth - labelwidth/2;
                while(curstart < labelend){
                    curstart += gridwidth;
                    gap ++;
                }
                var xPos = this.grid_rectangle.left;
                for (var i=1; i < this.numOfDivisions; i++){
                    //var tmp = this.min + (this.max - this.min) / this.numOfDivisions * i;
                    var dateIndex = Math.round(this.dateData.length / this.numOfDivisions * i);
                    //const txt = tmp.toFixed(3) + ' ' + this.units;
                    const txt = this.dateData[dateIndex];
                    this.ctx.textAlign = "center";
                    if(i%(gap+1) !==0) continue;
                    xPos = (this.grid_rectangle.right - this.grid_rectangle.left) * i / this.numOfDivisions + this.grid_rectangle.left;
                    if(xPos + labelwidth > xPos1) continue;
                    this.ctx.fillText(txt, xPos, yPos);
                }

            // add right labels for x-axis
            const tText = this.endDate;
            this.ctx.textAlign = "right";
            if(this.plotType === PT.PlotType.WaveformCCDF) this.ctx.textAlign = "center";
            this.ctx.fillText(tText, xPos1, yPos);
        };
    }
};
