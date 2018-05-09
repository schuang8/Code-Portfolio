/**
 * Keysight Confidential
 * Copyright Keysight Technologies
 *
 * @module MarkerController
 * Creating and deleting all kinds of markers, generating marker labels(non-overlapping) and annotations.
 *
 * @author Xian Wu
 * 08/02/2017
 */

/** Usage of MarkerController:
 *
 * 1. new MC.MarkerController(twgl, canvas, hud, ctx);
 * 2. must do: setRectangleInit(your_rect, your_H_step);
 * 3. then you can do: add###Marker(); deleteMarker(id);
 * 4. must do: before rendering, making sure you 'gl.viewport' and 'gl.scissor' the WebGL rectangle according to the marker_controller's newest rectangle value
 * 5. setAxis() : this will calculate the position on gl canvas for each marker
 * 6. render()
 *
 */

module.exports = {

    MarkerController: function(twgl, canvas, hud, ctx) {
        const CD = require('../other/colors.js');
        const SM = require('../other/SampleMarker.js');
        const DM = require('../other/DeltaMarker.js');
        const PM = require('../other/PeakMarker.js');
        var Heap = require('heap');

        const colors = new CD.Colors().colors;   //!< get color codes in regulated order
        this.txtReg = [];                      //!< keep records of all text positions, to get rid of overlapping among labels
        this.markers = [];                     //!< 2D-array markers[i] corresponding to the markers of traces[i]
        this.line_cnt = 0;                     //!< line count for the annotation box
        this.sum = 0;                          //!< marker sum
        this.rect;                             //!< current WebGL rectangle
        this.H_step;                           //!< line width for each annotation

        this.xunits = "  sec   ";              //2 spaces before and 3 spaces after
        this.yunits = "  V   ";                //2 spaces before and 3 spaces after

        this.logy = false;
        this.fakezero = false;
        this.fakevalue = 0;

        this.setPlot = function(p){
            switch(p){
                case 0:
                    this.xunits = "  sec   ";
                    this.yunits = "  V   ";
                    break;
                case 1:
                    this.xunits = "  dB   ";
                    this.yunits = "  MHz   ";
                    break;
            }
        };

        this.setUnits = function(xu,yu){
            this.xunits = "  " + xu + "   ";
            this.yunits = "  " + yu + "   ";
        };

        this.setLogY = function(if_logy,fakezero,fakevalue){
            this.logy = if_logy;
            this.fakezero = fakezero;
            this.fakevalue = fakevalue;
        }

        this.setFont = function(fontsize,fonttype)
        {
            for(var i=0;i<this.markers.length;i++) {
                for(var j=0;j<this.markers[i].length;j++)
                {
                    this.markers[i][j].setFont(fontsize,fonttype);
                }
            }
        }

        /**The Initialization function for MarkerController, initialize the WebGL rectangle size and the line width for each annotation
         * @param   r: WebGL rectangle  H_step: line width for each annotation
         */
        this.setRectangleInit = function(r,H_step)
        {
            this.rect = r;
            this.H_step = H_step;
            this.rectangleUpdate(Math.min(this.line_cnt,this.sum));
        }

        /**Change the annotation box size by setting the line_cnt, which will also cause the WebGL rectangle resizing
         * @param   lc : the new line_cnt value
         * important : the current line count = min (the max line_cnt allowed, the sum of markers you have)
         */
        this.setLineCnt = function(lc)
        {
            var curlines = Math.min(this.line_cnt,this.sum);
            if(lc  < curlines) this.rectangleUpdate(lc - curlines);
            this.line_cnt = lc;
        }

        /**Set the axis range for each marker, thus they know about their position on the WebGL canvas
         * @param   [xmin, xmax] : x-axis range    [ymin, ymax] : y-axis range
         */
        this.setAxis = function(xmin,xmax,ymin,ymax)
        {
            this.xmin = xmin;
            this.xmax = xmax;
            this.ymin = ymin;
            this.ymax = ymax;
            /// set position for each marker according to axis
            for(var i=0;i<this.markers.length;i++) {
                for(var j=0;j<this.markers[i].length;j++)
                {
                    this.markers[i][j].AxisPosUpdate(xmin,xmax,ymin,ymax);
                }
            }
        }

        /**updating the rectangle top value according to the annotation box resizing
         * @param   i>0, top boundary move down i lines, i<0, top boundary move up -i lines
         * again : the webtraceview's gl canvas should resize itself before rendering according to the marker_controller's new rectangle value
         */
        this.rectangleUpdate = function(i)
        {
            this.rect.top += this.H_step*i;
        }


        /**this creates a sample marker according to the trace data and the x-value you want to track
         * @param   trace : the trace you're tracking
         * @param   tc : tracecontroller
         * @param   xvalue : x-value for tracking, which may not be the actual x-value you get. If there is no data for x=0.51, pick up the nearest 0.515 instead.
         */
        this.addSampleMarker =function(trace,tc,xvalue,fakey,yvalue_label) {
            var index = tc.traces.length;                         /// the row number in markers 2-d array corresponding to their trace index in tc.traces
            for (var i = 0; i < tc.traces.length; i++) {
                if (tc.traces[i].id == trace.id) {
                    index = i;
                    break;
                }
            }
            if(index >= tc.traces.length) return;
            var m = new SM.SampleMarker(twgl, canvas, hud, ctx);
            m.id = this.sum;
            m.setLabelContent(m.type+' Mrk'+m.id);                /// set label content and color according to its id
            m.setColor(colors[m.id]);
            m.setTracking(tc, index, xvalue);                     /// finding the tracking point [xvalue, yvalue] for you,
            m.setYlabel(yvalue_label, fakey);
            while(this.markers.length <= index){                  /// with setAxis, the gl position can be calculated
                this.markers.push([]);
            }
            this.markers[index].push(m);
            this.sum ++;
            if(this.sum<=this.line_cnt)                           /// maybe update the rectangle
            {
                this.rectangleUpdate(1);
            }
        }

        /**this creates a delta marker pair according to the trace data, x-base-value and x-delta-value you want to track
         * @param   trace : the trace you're tracking
         * @param   tc : tracecontroller
         * @param   xbase : xvalue for the first marker = xbase
         * @param   xdelta : xvalue for the second marker = xbase + xdelta
         */
        this.addDeltaMarker =function(trace,tc,xbase,xdelta) {
            var index = tc.traces.length;                         /// the row number in markers 2-d array corresponding to their trace index in tc.traces
            for (var i = 0; i < tc.traces.length; i++) {
                if (tc.traces[i].id == trace.id) {
                    index = i;
                    break;
                }
            }
            if(index >= tc.traces.length) return;
            var m = new DM.DeltaMarker(twgl, canvas, hud, ctx);
            m.id = this.sum;
            m.setLabelContent(m.type+' Mrk'+m.id);                /// set label content and color according to its id
            m.setColor(colors[m.id]);
            m.setTracking(tc, index, xbase,xdelta);               /// finding the tracking point [xbase, ybase] [xbase+xdelta, y] for you,
            while(this.markers.length <= index){                  /// with setAxis, the gl position can be calculated
                this.markers.push([]);
            }
            this.markers[index].push(m);
            this.sum ++;
            if(this.sum<=this.line_cnt)                           /// maybe update the rectangle
            {
                this.rectangleUpdate(1);
            }
        }

        /**this creates a peak marker according to the trace data and the x-value near which you want to track
         * @param   trace : the trace you're tracking
         * @param   tc : tracecontroller
         * @param   xvalue : x-value near which you want to find a peak
         * @param   maxpeak : maxpeak = true, then find a local maximum, false, then find a local minimum
         */
        this.addPeakMarker =function(trace,tc,xvalue,maxpeak) {
            var index = tc.traces.length;                         /// the row number in markers 2-d array corresponding to their trace index in tc.traces
            for (var i = 0; i < tc.traces.length; i++) {
                if (tc.traces[i].id == trace.id) {
                    index = i;
                    break;
                }
            }
            if(index >= tc.traces.length) return;
            var m = new PM.PeakMarker(twgl, canvas, hud, ctx);
            m.id = this.sum;
            m.setLabelContent(m.type+' Mrk'+m.id);                /// set label content and color according to its id
            m.setColor(colors[m.id]);
            m.setTracking(tc, index, xvalue,maxpeak);             /// finding the tracking point [x, y] for you,
            while(this.markers.length <= index){                  /// with setAxis, the gl position can be calculated
                this.markers.push([]);
            }
            this.markers[index].push(m);
            this.sum ++;
            if(this.sum<=this.line_cnt)                           /// maybe update the rectangle
            {
                this.rectangleUpdate(1);
            }
        }

        /**this updates the markers 2-d array by deleting the row of markers belonging to the trace just deleted
         * and updating everyone's id.
         * @param   trace : the trace just deleted
         * notice : Though there are 3 for-loop, the actually complexity is still O(nm) n is marker numbers and m is deleted marker counts
         */
        this.deleteTraceUpdateMarkers = function(trace, tc)
        {
            var index;                                         /// get trace index
            for (var i = 0; i < tc.traces.length; i++) {
                if (tc.traces[i].id == trace.id) {
                    index = i;
                    break;
                }
            }
            var mrks_deleted = this.markers[index];
            this.markers.splice(index,1);                      /// delete the target row in markers
            this.sum -= mrks_deleted.length;
            for(var i = 0;i<this.markers.length;i++)           /// update all the marker ids
            {
                for(var j=0;j<this.markers[i].length;j++)
                {
                    var former_id = this.markers[i][j].id;
                    for(var k=0;k < mrks_deleted.length;k++){
                        if(mrks_deleted[k].id < former_id)
                        {
                            this.markers[i][j].id -- ;
                        }
                    }
                    this.markers[i][j].setLabelContent(this.markers[i][j].type+' Mrk'+this.markers[i][j].id);
                    this.markers[i][j].setColor(colors[this.markers[i][j].id]);
                }
            }
        }

        /**delete markers by id and updating everyone's id.
         */
        this.deleteMarker = function(id) //also update everyone's id
        {
            for(var i=0;i<this.markers.length;i++)
            {
                for(var j=0;j<this.markers[i].length;j++)
                {
                    if(this.markers[i][j].id == id){
                        this.markers[i].splice(j,1);
                        j--;
                        this.sum --;
                    }else if(this.markers[i][j].id > id){
                        this.markers[i][j].id --;
                        this.markers[i][j].setLabelContent(this.markers[i][j].type+' Mrk'+this.markers[i][j].id);
                        this.markers[i][j].setColor(colors[this.markers[i][j].id]);
                    }
                }
            }
        }

        /**get the first k markers (first means their id, or the order when adding) for annotations.
         * in each row of the markers 2-d array, the marker ids are in order
         * If R = row_number, then push the first marker of each row into a heap
         * there will be less than or equal to R elements in the heap, since some rows may be empty
         * each time pop a marker out of the heap, if the marker is from i-th row, the push the next marker on the ith row into the heap
         * the complexity is Rlog(R)
         *
         * @return result : array for first k markers
         */
        this.getfirstKmarkers = function(k)
        {
            var result = [];
            var heap = new Heap(function(a,b){return a.marker.id - b.marker.id;});
            var count = this.markers.length;                                        /// heap size should be row_count
            var cur_ind = new Array(count).fill(0);
            for(var i=0;i<count;i++){                                               /// building the heap
                if(cur_ind[i]<this.markers[i].length){
                    heap.push({'marker':this.markers[i][cur_ind[i]],'ind':i});
                    cur_ind[i]++;
                }
            }
            while(result.length<k)                                                  /// pop out k times
            {
                var the_top = heap.pop();
                result.push(the_top.marker);
                var i = the_top.ind;
                if(cur_ind[i]<this.markers[i].length){
                    heap.push({'marker':this.markers[i][cur_ind[i]],'ind':i});
                    cur_ind[i]++;
                }
            }
            return result;
        }


        /** Generate and set text positions for those labels and annotations
         */
        this.GenerateAllTextPosition = function(){
            this.txtReg = [];
            /// labels
            for(var i=0;i<this.markers.length;i++)
                for(var j=0;j<this.markers[i].length;j++)
                {
                    if(this.markers[i][j].type == 'Delta'){
                        this.coordTrans(this.markers[i][j].basemarker);
                        this.coordTrans(this.markers[i][j].deltamarker);
                        if(!this.markers[i][j].basemarker.nulldata){
                            var basemarker_yvalue = this.markers[i][j].basemarker.yvalue;
                            var deltamarker_yvalue = this.markers[i][j].deltamarker.yvalue;
                            if(this.logy) {
                                basemarker_yvalue = Math.pow(10,this.markers[i][j].basemarker.yvalue);
                                deltamarker_yvalue = Math.pow(10,this.markers[i][j].deltamarker.yvalue);
                            }
                            if(this.fakezero && this.markers[i][j].basemarker.yvalue === this.fakevalue) { continue; }
                            if(this.fakezero && this.markers[i][j].deltamarker.yvalue === this.fakevalue) { continue; }

                            var content = "base: ";
                            content += (this.markers[i][j].basemarker.xvalue).toFixed(2) + this.xunits + (basemarker_yvalue).toFixed(6) + this.yunits;
                            this.markers[i][j].basemarker.setLabelContent("    "+content+"    ");

                            content = "delta: ";
                            content += (this.markers[i][j].deltamarker.xvalue).toFixed(2) + this.xunits + (deltamarker_yvalue).toFixed(6) + this.yunits;
                            this.markers[i][j].deltamarker.setLabelContent("    "+content+"    ");

                        }else{
                            var content = "base: ";
                            content += (this.markers[i][j].basemarker.xvalue).toFixed(2) + this.xunits + "unknown" + this.yunits;
                            this.markers[i][j].basemarker.setLabelContent("    "+content+"    ");
                            content = "delta: ";
                            content += (this.markers[i][j].deltamarker.xvalue).toFixed(2) + this.xunits + "unknown" + this.yunits;
                            this.markers[i][j].deltamarker.setLabelContent("    "+content+"    ");
                        }
                    }else {
                        this.coordTrans(this.markers[i][j]);
                        var content = "";
                        if(!this.markers[i][j].nulldata){
                            var the_yvalue = this.markers[i][j].yvalue;
                            if(this.markers[i][j].fakey) the_yvalue = this.markers[i][j].yvalue_label;
                            if(this.logy) the_yvalue = Math.pow(10,the_yvalue);
                            if(this.fakezero && this.markers[i][j].yvalue === this.fakevalue) { continue; }
                            if(Math.abs(the_yvalue) < 0.001)
                                content += (this.markers[i][j].xvalue).toFixed(2) + this.xunits + (the_yvalue.toExponential(3)) + this.yunits;
                            else
                                content += (this.markers[i][j].xvalue).toFixed(2) + this.xunits + (the_yvalue).toFixed(3) + this.yunits;
                        }else{
                            content += (this.markers[i][j].xvalue).toFixed(2) + this.xunits + 'Unknown' + this.yunits;
                        }
                        this.markers[i][j].setLabelContent("    "+content+"    ");
                    }
                }
            /// details (annotations)
            var lines = Math.min(this.line_cnt,this.sum);
            var firstlinepos = this.rect.top - lines*this.H_step;
            var mrks = this.getfirstKmarkers(lines);
            for(var i=0;i<lines;i++)
            {
                var m = mrks[i];
                if(m.type == 'Delta'){
                    m.basemarker.showdetail = true;
                    m.basemarker.setDetailPos(this.rect.left, firstlinepos + i * this.H_step);
                    if (!m.basemarker.nulldata) {
                        var basemarker_yvalue = m.basemarker.yvalue;
                        var deltamarker_yvalue = m.deltamarker.yvalue;
                        if(this.logy) { basemarker_yvalue = Math.pow(10,m.basemarker.yvalue); deltamarker_yvalue = Math.pow(10,m.deltamarker.yvalue); }
                        if(this.fakezero && m.basemarker.yvalue === this.fakevalue) { continue; }
                        if(this.fakezero && m.deltamarker.yvalue === this.fakevalue) { continue; }
                        m.basemarker.setDetailContent('Mrk' + i + '     ' + (m.basemarker.xvalue).toFixed(2) + this.xunits + (basemarker_yvalue).toFixed(6) + this.yunits
                            + '     ' + (m.deltamarker.xvalue).toFixed(2) + this.xunits + (deltamarker_yvalue).toFixed(6) + this.yunits);
                    }
                    else {
                        m.basemarker.setDetailContent('Mrk' + i + '     ' + (m.basemarker.xvalue).toFixed(2) + this.xunits + 'Unknown' + this.yunits);
                    }
                }else {
                    m.showdetail = true;
                    m.setDetailPos(this.rect.left, firstlinepos + i * this.H_step);
                    if (!m.nulldata) {
                        var the_yvalue = m.yvalue;
                        if(this.logy) the_yvalue = Math.pow(10,m.yvalue);
                        if(this.fakezero && m.yvalue === this.fakevalue) { continue; }
                        m.setDetailContent('Mrk' + i + '     ' + (m.xvalue).toFixed(2) + this.xunits + (the_yvalue).toFixed(6) + this.yunits);
                    }
                    else m.setDetailContent('Mrk' + i + '     ' + (m.xvalue).toFixed(2) + this.xunits + 'Unknown' + this.yunits);
                }

            }

        }

        /** Helper function of @coordTrans()
         *  Revise the current marker's label position according to the existing label positions in the this.txtreg[]
         *  making sure they would rather destroy themselves than overlap others !!! no just kidding
         *  moving toward the boundaries till finding a proper place and stay within, and overlapping with others if inevitable by the boundaries
         */
        this.LabelPositionRevise = function(x,y,tw,fontsize)
        {
            var cnt = [0,0,0,0];
            x += 10;
            if (x+tw > this.rect.right) x = this.rect.right - tw - 5;
            if (x-this.rect.left<5) x += 5;
            if (y-fontsize < this.rect.top) y = this.rect.top + fontsize + 5;
            if (y+fontsize > this.rect.bottom) y = this.rect.bottom - fontsize;
            var current = function() { return {'cx':x,'cy':y,'txtwidth':tw}; }; /// it is function, thus creating new object each time, up, down, left, right : 4 possible place
            var move = [];
            for(var j=0;j<4;j++) move.push(current());
            var OutOfBorder = [false,false,false,false];

            for (var i=0;i<this.txtReg.length;i++)
            {
                if(!OutOfBorder[0]&&this.overlap(this.txtReg[i],move[0],fontsize))               ///update 'up' by moving 'up' up
                {
                    move[0].cy = this.txtReg[i].cy-fontsize;
                    if(move[0].cy-fontsize<this.rect.top) OutOfBorder[0] = true;
                    cnt[0]++;
                }
                if(!OutOfBorder[1]&&this.overlap(this.txtReg[i],move[1],fontsize))               ///update 'down' by moving 'down' down
                {
                    move[1].cy = this.txtReg[i].cy+fontsize;
                    if(move[1].cy+fontsize>this.rect.bottom) OutOfBorder[1] = true;
                    cnt[1]++;
                }
                if(!OutOfBorder[2]&&this.overlap(this.txtReg[i],move[2],fontsize))               ///update 'left' by moving 'left' left
                {
                    move[2].cx = this.txtReg[i].cx - tw;
                    if(move[2].cx < this.rect.left) OutOfBorder[2] = true;
                    cnt[2]++;
                }
                if(!OutOfBorder[3]&&this.overlap(this.txtReg[i],move[3],fontsize))               ///update 'right' by moving 'right' right
                {
                    move[3].cx = this.txtReg[i].cx + this.txtReg[i].txtwidth;
                    if(move[3].cx > this.rect.right) OutOfBorder[3] = true;
                    cnt[3]++;
                }
            }
            var mincnt = 1000;                                                  /// whatever a large number that your marker count cannot reach
            var index = 0;
            for(var i=0;i<4;i++)                                                /// picking up the best move[index] which walked across the least labels
            {
                if(cnt[i]<mincnt&& !OutOfBorder[i])
                {
                    mincnt = cnt[i];
                    index = i;
                }
            }
            return move[index];                                                 /// return the revised position
        }

        /** Helper function of @LabelPositionRevise ()
         * Determine if two labels (exist and curr) overlap or not
         */
        this.overlap = function(exist,curr,fontsize)
        {
            if(curr.cx>=exist.cx && curr.cx<=exist.cx+exist.txtwidth)
            {
                if(!(curr.cy>exist.cy+fontsize || curr.cy<exist.cy-fontsize)) { return true;}
            }
            if(curr.cx + curr.txtwidth>=exist.cx && curr.cx+ curr.txtwidth<=exist.cx+exist.txtwidth)
            {
                if(!(curr.cy>exist.cy+fontsize || curr.cy<exist.cy-fontsize)) { return true;}
            }
            if(curr.cx <= exist.cx && curr.cx + curr.txtwidth>= exist.cx+exist.txtwidth)
            {
                if(!(curr.cy>exist.cy+fontsize || curr.cy<exist.cy-fontsize)) { return true;}
            }
            return false;
        }

        /** x y are GL coordinates, change them to layout pixels coordinates for those texts
         */
        this.coordTrans = function(marker)
        {
            var x = marker.x;
            var y = marker.y;
            var txtwidth = marker.textdrawer.getTextWidth();
            var fontsize = marker.fontsize;
            var cx = (x + 1.0)/2*(this.rect.right-this.rect.left) + this.rect.left;
            var cy = (1.0-y)/2*(this.rect.bottom-this.rect.top) + this.rect.top;
            marker.showdetail = false;
            marker.showlabel = true;
            if (x<-1||x>1||y<-1||y>1){                                    /// might be useful when zoom in, zoom out
                marker.showlabel = false;
                return;
            }
            var revised = this.LabelPositionRevise(cx,cy,txtwidth,fontsize);
            cx = revised.cx;
            cy = revised.cy;
            this.txtReg.push({'cx':cx,'cy':cy,'txtwidth':txtwidth});
            marker.setLabelPos(cx,cy);
        }


        this.render = function() {
            this.GenerateAllTextPosition();                 /// before each marker rendering, must generate text positions for them
            for(var i=0;i<this.markers.length;i++) {
                for(var j=0;j<this.markers[i].length;j++) {
                    this.markers[i][j].render();
                }
            }
        }
    }
};

