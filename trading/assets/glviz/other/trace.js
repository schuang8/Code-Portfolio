module.exports =
    {
        Trace: function (id)
        {
            this.id = id;
            this.xunits    = "";
            this.yunits    = "";

            this.xlog = false; //?
            this.ylog = false; //?

            this.xarray = [];
            this.yarray = [];
            this.line_color = [1.0, 0.0, 0.0, 1.0];

            this.maxX;
            this.maxY;
            this.minX;
            this.minY;

            this.setTraceid = function(id) {
                this.id = id;
            };

            this.setData = function (xarray, yarray)
            {
                var N = yarray.length;
                // if arrays don't match
                if (xarray.length < N) {
                    console.log('arrays dont match');
                    xarray = [];
                    for (var k = 0; k < yarray.length; ++k) {
                        xarray.push(k);
                    }
                }
                // var date_as_int = [];
                // if (typeof xarray[0] === 'string') {
                //     for (var i = 0; i < xarray.length; i++) {
                //         var date = new Date(xarray[i]);
                //         date_as_int.push(date);
                //     }
                // }


                // for (var i = 0; i < xarray.length; i++) {
                //     this.xarray.push(i);
                // }


                

                this.xarray = xarray;
                this.yarray = yarray;

                // has to be done this way due to no ECMA6 support
                this.minX = this.xarray.reduce(function(x,y) { return Math.min(x,y); }, this.xarray[0]);
                this.maxX = this.xarray.reduce(function(x,y) { return Math.max(x,y); }, this.xarray[0]);
                this.minY = this.yarray.reduce(function(x,y) { return Math.min(x,y); }, this.yarray[0]);
                this.maxY = this.yarray.reduce(function(x,y) { return Math.max(x,y); }, this.yarray[0]);
            };
        }
    };

