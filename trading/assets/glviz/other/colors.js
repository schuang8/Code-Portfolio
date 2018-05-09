/**
 * Created by shihanbi on 7/26/2017.
 */
module.exports = {
  Colors: function() {
    this.colors = [];
    this.color = function(r, g, b) {
      return [r / 255, g / 255, b / 255, 0.1];
    };
    this.colors.push(this.color(250, 255, 0));
    this.colors.push(this.color(51, 255, 0));
    this.colors.push(this.color(51, 133, 255));
    this.colors.push(this.color(255, 0, 92));
    this.colors.push(this.color(0, 255, 255));
    this.colors.push(this.color(255, 0, 255));
    this.colors.push(this.color(136, 64, 255));
    this.colors.push(this.color(255, 96, 32));
    this.colors.push(this.color(153, 255, 182));
    this.colors.push(this.color(255, 196, 128));
    this.colors.push(this.color(221, 118, 147));
    this.colors.push(this.color(192, 144, 255));
  }
};
