module.exports =
{
    TextDrawer: function (overlay_hud, overlay_ctx)
    {
        // overlay canvas element
        this.hud = overlay_hud;
        // context from the canvas
        this.ctx = overlay_ctx;

        // text to print
        this.txt = "";
        // default alignment
        this.align = "left";
        // default coordinates
        this.txtCoord =
        {
            x: 0,
            y: 0,
        }
        this.textColor = "#FFFFFF";
        this.font = "24px Roboto";

        this.setCoord = function(xCoord, yCoord)
        {
            this.txtCoord.x = xCoord;
            this.txtCoord.y = yCoord;
        }

        this.setTextAlign = function(alignment)
        {
            this.align = alignment;
        }

        this.setText = function(text)
        {
            this.txt = text;
        }

        // TODO: if rgba values need to be [0,255], [0,1] need to be able to determine what format was passed in
        this.setTextColor = function(colorarray)
        {
            this.textColor = "rgba("+Math.ceil(colorarray[0]*255)+","+Math.ceil(colorarray[1]*255)+","+Math.ceil(colorarray[2]*255)+","+Math.ceil(colorarray[3]*255)+")";
        }

        this.setFont = function(fontsize,fonttype)
        {
            this.font = fontsize+'px '+fonttype;
        }

        /**
         * Get the width of a text in pixels
         * @param  text optional argument. if present then compute width of this string. else, compute width of text already saved
         * @return the width of the provided text
         */
        this.getTextWidth = function (text)
        {
            if (arguments.length == 1)
            {
                return this.ctx.measureText(text).width;
            }
            else
            {
                return this.ctx.measureText(this.txt).width;
            }
        }

        this.render = function()
        {
            // in case someone else changes ctx's text alignment
            this.ctx.textAlign = this.align;
            this.ctx.fillStyle = this.textColor;
            this.ctx.font = this.font;
            this.ctx.fillText( this.txt, this.txtCoord.x, this.txtCoord.y);
        }
    }
};
