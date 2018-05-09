module.exports = {
    PeakMarker: function(twgl, canvas, hud, ctx) {
        const MD = require('../drawers/MarkerDrawer.js');
        MD.MarkerDrawer.call(this,twgl, canvas, hud, ctx);
        this.type = 'Peak';

        this.xvalue = 0;
        this.yvalue = 0;
        this.xvalue_actual = 0;

        this.nulldata = false;  //no data for this tracking point

        this.maxpeak = true;

        this.setTracking = function(tracecontroller,id,xvalue,maxpeak) //get (xvalue,yvalue)
        {
            this.trace = tracecontroller.traces[id];
            this.xvalue = xvalue;
            this.traceid = id;
            var xarray = this.trace.xarray;
            var yarray = this.trace.yarray;
            var index = this.findpeak(xarray,yarray,xvalue,maxpeak);
            if(index == -1) this.nulldata =true;
            if(!this.nulldata) this.yvalue = yarray[index];
            this.xvalue_actual = xarray[index];
        }

        this.findpeak = function(xarray,yarray,xvalue,maxpeak)  //return the index
        {
            var cur_index;
            for(cur_index=0; cur_index<xarray.length; cur_index++){
                if(xvalue<=xarray[cur_index]) break;
            }
            if(cur_index==xarray.length || (cur_index==0 && xvalue!=xarray[cur_index])) {
                this.nulldata =true;
                return -1;
            }
            //searching on its right and left, loop break at the first peak
            var right = cur_index;
            var left = cur_index;
            var result_index = -1;

            while(right<xarray.length || left>=0)
            {
                if(right-1>=0 && right+1<xarray.length){
                    if(maxpeak && yarray[right]>=yarray[right-1] && yarray[right]>=yarray[right+1]){
                        result_index = right; break;
                    }
                    if((!maxpeak) && yarray[right]<=yarray[right-1] && yarray[right]<=yarray[right+1])
                    {
                        result_index = right; break;
                    }
                }
                if(left-1>=0 && left+1<xarray.length){
                    if(maxpeak && yarray[left]>=yarray[left-1] && yarray[left]>=yarray[left+1]){
                        result_index = left; break;
                    }
                    if((!maxpeak) && yarray[left]<=yarray[left-1] && yarray[left]<=yarray[left+1])
                    {
                        result_index = left; break;
                    }
                }
                right++;
                left--;
            }
            return result_index;
        }

        this.AxisPosUpdate = function(xmin,xmax,ymin,ymax) //get marker position
        {
            this.xmin = xmin;
            this.xmax = xmax;
            this.ymin = ymin;
            this.ymax = ymax;
            this.setPosition((this.xvalue_actual-xmin)*2/(xmax-xmin) - 1.0,(this.yvalue-ymin)*2/(ymax-ymin) - 1.0);
        }

    }
};
