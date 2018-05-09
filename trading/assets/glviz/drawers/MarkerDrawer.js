module.exports = {
    MarkerDrawer: function(twgl, canvas, hud, ctx) {
      //draw marker, set marker position, fill, size, txt position, detail postion, color
      const LD = require('./linedrawer.js');
      const TXD = require('./textdrawer.js');

      this.line_drawer_unfill = new LD.LineDrawer(twgl,canvas);
      this.line_drawer_fill = new LD.LineDrawer(twgl,canvas);
      this.gl = this.line_drawer_fill.gl;
      this.textdrawer = new TXD.TextDrawer(hud, ctx);
      this.textdrawer.setTextAlign('left');
      this.detaildrawer = new TXD.TextDrawer(hud, ctx);
      this.detaildrawer.setText('');
      this.detaildrawer.setTextAlign('left');

      this.pixelsize = 15;
      this.size = 2*this.pixelsize/(canvas.width);
      this.WidthHeightRatio = (canvas.width)/(canvas.height);
      this.x = 0;       //marker coordinates, gl [-1,1]
      this.y = 0;
      this.tx = 0;      //label coordinates, pixel
      this.ty = 0;
      this.dx = 0;      //detail coordinates, pixel
      this.dy = 0;
      this.showdetail = false;
      this.showlabel = true;
      this.nulldata = false;
      this.fill = 1;
      this.fontsize = 15;
      this.fonttype = 'arial';

      this.id = 0;
      this.traceid = 0;

      this.setFill = function(f)
      {
          this.fill = f;
      }
      this.setDetailContent = function(text)
      {
          this.detaildrawer.setText(text);
      }
      this.setLabelContent = function(text)
      {
          this.textdrawer.setText(text);
      }
      this.setDetailPos = function(dx,dy)
      {
          this.dx = dx;
          this.dy = dy;
      }
      this.setLabelPos = function(tx,ty)
      {
          this.tx = tx;
          this.ty = ty;
      }

      this.setFont = function (fontsize,fonttype){
          this.fontsize = fontsize;
          this.fonttype = fonttype;
      }

      this.setPosition = function(x,y){
        this.x = x;
        this.y = y;
        this.xyzdata1 = [
          x-this.size,y,0,
          x+this.size,y,0,
          x,y+this.size*this.WidthHeightRatio,0,
          x-this.size,y,0,
          x+this.size,y,0,
          x,y-this.size*this.WidthHeightRatio,0];
        this.line_drawer_fill.setArray(this.xyzdata1);
        this.xyzdata2 = [
          x-this.size,y,0,
          x,y+this.size*this.WidthHeightRatio,0,
          x+this.size,y,0,
          x,y-this.size*this.WidthHeightRatio,0,
          x-this.size,y,0
        ]
        this.line_drawer_unfill.setArray(this.xyzdata2);
      }

      this.setColor = function(c)
      {
        this.line_drawer_fill.line_color = c;
        this.line_drawer_unfill.line_color = c;
        this.textdrawer.setTextColor(c);
        this.detaildrawer.setTextColor(c);

      }

      this.setSize = function(s)
      {
        this.size = s;
        this.setPosition(this.x,this.y);
      }

      this.setShowDetails = function(s)
      {
          this.showdetail = s;
      }

      this.render = function() {

        this.textdrawer.setFont(this.fontsize,this.fonttype);
        this.detaildrawer.setFont(this.fontsize,this.fonttype);
        if(!this.nulldata) {
            if (this.fill == 1) {
                this.line_drawer_fill.line_mode = this.gl.TRIANGLES;
                this.line_drawer_fill.render();
            } else {
                this.line_drawer_unfill.render();
            }
            this.textdrawer.setCoord(this.tx, this.ty);
            if(this.showlabel) this.textdrawer.render();
        }
        if(this.showdetail){
            this.detaildrawer.setCoord(this.dx,this.dy);
            this.detaildrawer.render();
        }
      }
    }
  };

