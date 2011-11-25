(function() {

  /*
      svgmap - a simple toolset that helps creating interactive thematic maps
      Copyright (C) 2011  Gregor Aisch
  
      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.
  
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.
  
      You should have received a copy of the GNU General Public License
      along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */

  var Color, ColorScale, Diverging, Ramp, root, svgmap, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  svgmap = (_ref = root.svgmap) != null ? _ref : root.svgmap = {};

  if ((_ref2 = svgmap.color) == null) svgmap.color = {};

  Color = (function() {

    /*
    	data type for colors
    	
    	eg.
    	new Color() // white
    	new Color(255,0,0) // defaults to rgb color
    	new Color([255,0,0]) // this also works
    	new Color(0,1,.5,'hsl') // same color using HSL
    	new Color('#ff0000') // or hex value
    */

    function Color(x, y, z, m) {
      var me, _ref3;
      me = this;
      if (x == null) x = [255, 255, 255];
      if (x.length === 3) {
        m = y;
        _ref3 = x, x = _ref3[0], y = _ref3[1], z = _ref3[2];
      }
      if (x.length === 7) {
        m = 'hex';
      } else {
        if (m == null) m = 'rgb';
      }
      if (m === 'rgb') {
        me.rgb = [x, y, z];
      } else if (m === 'hsl') {
        me.rgb = Color.hsl2rgb(x, y, z);
      } else if (m === 'hex') {
        me.rgb = Color.hex2rgb(x);
      }
    }

    Color.prototype.toString = function() {
      return Color.rgb2hex(this.rgb);
    };

    Color.prototype.hsl = function() {
      return Color.rgb2hsl(this.rgb);
    };

    Color.prototype.interpolate = function(f, col, m) {
      /*
      		interpolates between two colors
      		eg
      		new Color('#ff0000').interpolate(0.5, new Color('#0000ff')) == '0xffff00'
      */
      var dh, hue, hue0, hue1, lbv, lbv0, lbv1, me, sat, sat0, sat1, xyz0, xyz1;
      me = this;
      if (m == null) m = 'hsl';
      if (m === 'hsl') {
        if (m === 'hsl') {
          xyz0 = me.hsl();
          xyz1 = col.hsl();
        }
        hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
        hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
        if (!isNaN(hue0) && !isNaN(hue1)) {
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if (lbv1 === 1 || lbv1 === 0) sat = sat0;
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if (lbv0 === 1 || lbv0 === 0) sat = sat1;
        } else {
          hue = void 0;
        }
        if (sat == null) sat = sat0 + f * (sat1 - sat0);
        lbv = lbv0 + f * (lbv1 - lbv0);
        return new Color(hue, sat, lbv, m);
      } else if (m === 'rgb') {
        xyz0 = me.rgb;
        xyz1 = col.rgb;
        return new Color(xyz0[0] + f * f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      } else {
        throw "color mode " + m + " is not supported";
      }
    };

    return Color;

  })();

  Color.hex2rgb = function(hex) {
    var b, g, r, u;
    u = parseInt(hex.substr(1), 16);
    r = u >> 16;
    g = u >> 8 & 0xFF;
    b = u & 0xFF;
    return [r, g, b];
  };

  Color.rgb2hex = function(r, g, b) {
    var str, u, _ref3;
    if (r.length === 3) _ref3 = r, r = _ref3[0], g = _ref3[1], b = _ref3[2];
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16).toUpperCase();
    return "#" + str.substr(str.length - 6);
  };

  Color.hsl2rgb = function(h, s, l) {
    var b, c, g, i, r, t1, t2, t3, _ref3, _ref4;
    if (h.length === 3) _ref3 = h, h = _ref3[0], s = _ref3[1], l = _ref3[2];
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = 0; i <= 2; i++) {
        if (t3[i] < 0) t3[i] += 1;
        if (t3[i] > 1) t3[i] -= 1;
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      _ref4 = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)], r = _ref4[0], g = _ref4[1], b = _ref4[2];
    }
    return [r, g, b];
  };

  Color.rgb2hsl = function(r, g, b) {
    var h, l, max, min, s, _ref3;
    if (r.length === 3) _ref3 = r, r = _ref3[0], g = _ref3[1], b = _ref3[2];
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = void 0;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) h += 360;
    return [h, s, l];
  };

  svgmap.color.Color = Color;

  ColorScale = (function() {

    function ColorScale() {}

    /*
    	base class for color scales
    */

    ColorScale.prototype.getColor = function(value) {
      return '#eee';
    };

    ColorScale.prototype.setClasses = function(numClasses, method, limits) {
      var self;
      if (numClasses == null) numClasses = 5;
      if (method == null) method = 'equalinterval';
      if (limits == null) limits = [];
      /*
      		# use this if you want to display a limited number of data classes
      		# possible methods are "equalinterval", "quantiles", "custom"
      */
      self = this;
      self.classMethod = method;
      self.numClasses = numClasses;
      self.classLimits = limits;
    };

    ColorScale.prototype.parseData = function(data, data_col) {
      var d, h, i, limits, max, method, min, num, p, pb, pr, self, sum, val, values, _i, _len, _ref3, _ref4;
      self = this;
      min = Number.MAX_VALUE;
      max = Number.MAX_VALUE * -1;
      sum = 0;
      values = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        d = data[_i];
        val = data_col != null ? d[data_col] : d;
        if (isNaN(val)) continue;
        min = Math.min(min, val);
        max = Math.max(max, val);
        values.push(val);
        sum += val;
      }
      values = values.sort();
      if (values.length % 2 === 1) {
        self.median = values[Math.floor(values.length * 0.5)];
      } else {
        h = values.length * 0.5;
        self.median = values[h - 1] * 0.5 + values[h] * 0.5;
      }
      self.values = values;
      self.mean = sum / values.length;
      self.min = min;
      self.max = max;
      method = self.classMethod;
      num = self.numClasses;
      limits = self.classLimits;
      if (method != null) {
        if (method === "equalinterval") {
          for (i = 1, _ref3 = num - 1; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
            limits.push(min + (i / num) * (max - min));
          }
        } else if (method === "quantiles") {
          for (i = 1, _ref4 = num - 1; 1 <= _ref4 ? i <= _ref4 : i >= _ref4; 1 <= _ref4 ? i++ : i--) {
            p = values.length * i / num;
            pb = Math.floor(p);
            if (pb === p) {
              limits.push(values[pb]);
            } else {
              pr = p - pb;
              limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
            }
          }
        }
        limits.unshift(min);
        limits.push(max);
      }
    };

    ColorScale.prototype.classifyValue = function(value) {
      var i, limits, maxc, minc, n, self;
      self = this;
      limits = self.classLimits;
      if (limits != null) {
        n = limits.length - 1;
        i = 0;
        while (i < n && value >= limits[i]) {
          i++;
        }
        value = limits[i - 1] + (limits[i] - limits[i - 1]) * 0.5;
        minc = limits[0] + (limits[1] - limits[0]) * 0.3;
        maxc = limits[n - 1] + (limits[n] - limits[n - 1]) * 0.7;
        value = self.min + ((value - minc) / (maxc - minc)) * (self.max - self.min);
      }
      return value;
    };

    return ColorScale;

  })();

  Ramp = (function() {

    __extends(Ramp, ColorScale);

    function Ramp(col0, col1) {
      var me;
      if (col0 == null) col0 = '#fe0000';
      if (col1 == null) col1 = '#feeeee';
      if (typeof col0 === "string") col0 = new Color(col0);
      if (typeof col1 === "string") col1 = new Color(col1);
      me = this;
      me.c0 = col0;
      me.c1 = col1;
    }

    Ramp.prototype.getColor = function(value) {
      var f, me;
      me = this;
      if (isNaN(value)) {
        console.log('NaN..');
        return new Color('#dddddd');
      }
      value = me.classifyValue(value);
      f = (value - me.min) / (me.max - me.min);
      return me.c0.interpolate(f, me.c1);
    };

    return Ramp;

  })();

  svgmap.color.Ramp = Ramp;

  Diverging = (function() {

    __extends(Diverging, ColorScale);

    function Diverging(col0, col1, col2, center, mode) {
      var me;
      if (col0 == null) col0 = '#d73027';
      if (col1 == null) col1 = '#ffffbf';
      if (col2 == null) col2 = '#1E6189';
      if (center == null) center = 'median';
      if (mode == null) mode = 'hsl';
      if (typeof col0 === "string") col0 = new Color(col0);
      if (typeof col1 === "string") col1 = new Color(col1);
      if (typeof col2 === "string") col2 = new Color(col2);
      me = this;
      me.c0 = col0;
      me.c1 = col1;
      me.c2 = col2;
      me.mode = mode;
      me.center = center;
    }

    Diverging.prototype.getColor = function(value) {
      var c, col, f, me;
      me = this;
      if (isNaN(value)) return new Color('#dddddd');
      value = me.classifyValue(value);
      c = me.center;
      if (c === 'median') {
        c = me.median;
      } else if (c === 'mean') {
        c = me.mean;
      }
      if (value < c) {
        f = (value - me.min) / (c - me.min);
        col = me.c0.interpolate(f, me.c1, me.mode);
      } else if (value > c) {
        f = (value - c) / (me.max - c);
        col = me.c1.interpolate(f, me.c2, me.mode);
      } else {
        col = me.c1;
      }
      return col;
    };

    return Diverging;

  })();

  svgmap.color.Diverging = Diverging;

}).call(this);
