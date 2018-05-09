/**
 * Keysight Confidential
 * Copyright Keysight Technologies
 *
 * @module SampleMarker
 * that is able to tracking data according to the target x-value
 *
 * @author Xian Wu
 * 08/02/2017
 */

module.exports = {
    SampleMarker: function(twgl, canvas, hud, ctx) {
        const MD = require('../drawers/MarkerDrawer.js');
        MD.MarkerDrawer.call(this,twgl, canvas, hud, ctx);       /// fake inherit MarkerDrawer
        this.type = 'Sample';                                    /// for marker controller to know the type
        this.xvalue = 0;                                         /// the data value (differ with x from markerdrawer which is GL position)
        this.yvalue = 0;                                         /// the data value (differ with y from markerdrawer which is GL position)
        this.xvalue_actual = 0;                                  /// the actual x-value you can get, if xvalue = 0.51 not found, then take nearest xvalue_actual = 0.515
        this.nulldata = false;                                   /// no data for this tracking point, when the data goes out of the domain of trace data
        this.yvalue_label = 0;
        this.fakey = false;

        this.setYlabel = function(yvalue_label,fakey){
            this.yvalue_label = yvalue_label;
            this.fakey = fakey;
        }

        /**Get the xvalue and yvalue for the marker
         * @param id : the index in array tracecontroller.traces[]
         */
        this.setTracking = function(tracecontroller,id,xvalue)
        {
            this.trace = tracecontroller.traces[id];
            this.xvalue = xvalue;
            var xarray = this.trace.xarray;
            var yarray = this.trace.yarray;
            var index;
            for(index=0; index<xarray.length; index++){
                if(xvalue<=xarray[index]) break;
            }
            if(index==xarray.length || (index==0 && xvalue!=xarray[index])) this.nulldata =true;
            if(!this.nulldata) this.yvalue = yarray[index];
            this.xvalue_actual = xarray[index];
        }

        /**with the current axis range, calculate the GL position for
         * @param id : the index in array tracecontroller.traces[]
         */
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

