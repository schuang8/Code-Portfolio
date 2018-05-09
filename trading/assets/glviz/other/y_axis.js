module.exports =
    {
        Y_Axis: function (ctx) {
            var PT = require('./plotType.js');
            this.min = [];
            this.max = [];
            this.units = '';
            this.fontSize = 14;
            this.grid_rectangle;
            this.ctx = ctx;
            this.font = "14px arial";
            this.numOfDivisions = 10;
            this.plotType;

            this.setCCDF = function (plot, step) {
                this.numOfDivisions = step;
                this.plotType = plot;
            }
            this.setGridRectangle = function (rectangle) {
                this.grid_rectangle = rectangle;
            }

            this.setFont = function (size, type) {
                this.font = size + "px " + type;
                this.fontsize = size;
            }

            this.setMinVal = function (minVal) { this.min = minVal; };

            this.setMaxVal = function (maxVal) { this.max = maxVal; };

            this.setUnits = function (units) { this.units = units; };

            this.setPlotType = function (plotType) { this.plotType = plotType; };

            function numberWithCommas(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            }

            this.txtgeneration = function (number) {
                if (this.plotType === PT.PlotType.ValueComparison) {
                    
                    if (number === 0) return number.toFixed(2)+ " " + this.units + " ";
                    if (Math.abs(number) <= 9999 && !(Math.abs(number) < 0.001)) return number.toFixed(2)+ " " + this.units + " ";
                    return number.toExponential(2)+ " " + this.units + " ";
                } else {
                    if (number === 0) return this.units + number.toFixed(2);
                    if (Math.abs(number) <= 9999 && !(Math.abs(number) < 0.001)) return this.units + number.toFixed(2);
                    //return this.units + number.toFixed(2);
                    return this.units + numberWithCommas(Number(number.toFixed(2)));
                }
            };


            this.render = function () {
                const xPos = this.grid_rectangle.left;
                var yPos = this.grid_rectangle.bottom;

                this.ctx.font = this.font;
                this.ctx.fillStyle = "#FFFFFF";
                this.ctx.textAlign = "right";

                // keep track of numDivisions in the grid
                var txt = this.txtgeneration(this.min);
                this.ctx.fillText(txt, xPos, yPos);
                const numDivisions = 10;
                txt = (this.max - this.min) / numDivisions;
                txt = this.txtgeneration(txt);
                yPos = (this.grid_rectangle.bottom - this.grid_rectangle.top) * 2 / 3 + this.grid_rectangle.top;
                this.ctx.fillText(txt, xPos, yPos);
                this.ctx.fillText("/div ", xPos, yPos + this.fontSize);
                txt = this.txtgeneration(this.max);
                this.ctx.fillText(txt, xPos, this.grid_rectangle.top + this.fontSize);
                // } else {
                //     for (var i=0; i<=this.numOfDivisions; i++){
                //         var tmp = Math.pow(10, (this.max - i));
                //         txt = this.txtgeneration(tmp);
                //         if(this.numOfDivisions !== 0)
                //             yPos = (this.grid_rectangle.bottom - this.grid_rectangle.top) * i / this.numOfDivisions + this.grid_rectangle.top + 0.5 * this.fontsize;
                //         else
                //             yPos = this.grid_rectangle.top;
                //         this.ctx.fillText(txt, xPos, yPos);
                //     }
                // }
            };
        }
    };
