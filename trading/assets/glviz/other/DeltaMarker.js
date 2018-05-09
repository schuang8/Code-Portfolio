module.exports = {
    DeltaMarker: function(twgl, canvas, hud, ctx) {
        const SM = require('./SampleMarker.js');
        this.basemarker = new SM.SampleMarker(twgl, canvas, hud, ctx);
        this.deltamarker = new SM.SampleMarker(twgl, canvas, hud, ctx);

        this.id = 0;
        this.type = 'Delta';
        this.traceid = 0;

        this.setTracking = function(tracecontroller,id,x_base,x_delta){
            this.traceid = id;
            this.basemarker.setTracking(tracecontroller,id,x_base);
            this.deltamarker.setTracking(tracecontroller,id,x_base+x_delta);
        }

        this.AxisPosUpdate = function(xmin,xmax,ymin,ymax)
        {
            this.basemarker.AxisPosUpdate(xmin,xmax,ymin,ymax);
            this.deltamarker.AxisPosUpdate(xmin,xmax,ymin,ymax);
        }

        this.setLabelContent = function(text)
        {
            this.basemarker.setLabelContent(text+'-base');
            this.deltamarker.setLabelContent(text+'-delta');
        }

        this.setDetailContent = function(text)
        {
            this.basemarker.setDetailContent(text);
        }
        this.setColor = function(c)
        {
            this.basemarker.setColor(c);
            this.deltamarker.setColor(c);
        }

        this.setFont = function(fontsize,fonttype)
        {
            this.basemarker.setFont(fontsize,fonttype);
            this.deltamarker.setFont(fontsize,fonttype);
        }

        this.render = function()
        {
            this.basemarker.render();
            this.deltamarker.render();
        }

    }
};

