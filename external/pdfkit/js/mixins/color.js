// Generated by CoffeeScript 1.12.4
(function() {
  var PDFGradient, PDFLinearGradient, PDFRadialGradient, namedColors, ref;

  ref = require('../gradient'), PDFGradient = ref.PDFGradient, PDFLinearGradient = ref.PDFLinearGradient, PDFRadialGradient = ref.PDFRadialGradient;

  module.exports = {
    initColor: function() {
      this._opacityRegistry = {};
      this._opacityCount = 0;
      return this._gradCount = 0;
    },
    _normalizeColor: function(color) {
      var hex, part;
      if (color instanceof PDFGradient) {
        return color;
      }
      if (typeof color === 'string') {
        if (color.charAt(0) === '#') {
          if (color.length === 4) {
            color = color.replace(/#([0-9A-F])([0-9A-F])([0-9A-F])/i, "#$1$1$2$2$3$3");
          }
          hex = parseInt(color.slice(1), 16);
          color = [hex >> 16, hex >> 8 & 0xff, hex & 0xff];
        } else if (namedColors[color]) {
          color = namedColors[color];
        }
      }
      if (Array.isArray(color)) {
        if (color.length === 3) {
          color = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = color.length; i < len; i++) {
              part = color[i];
              results.push(part / 255);
            }
            return results;
          })();
        } else if (color.length === 4) {
          color = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = color.length; i < len; i++) {
              part = color[i];
              results.push(part / 100);
            }
            return results;
          })();
        }
        return color;
      }
      return null;
    },
    _setColor: function(color, stroke) {
      var gstate, name, op, space;
      color = this._normalizeColor(color);
      if (!color) {
        return false;
      }
      if (this._sMasked) {
        gstate = this.ref({
          Type: 'ExtGState',
          SMask: 'None'
        });
        name = "Gs" + (++this._opacityCount);
        this.page.ext_gstates[name] = gstate;
        this.addContent("/" + name + " gs");
      }
      op = stroke ? 'SCN' : 'scn';
      if (color instanceof PDFGradient) {
        this._setColorSpace('Pattern', stroke);
        color.apply(op);
      } else {
        space = color.length === 4 ? 'DeviceCMYK' : 'DeviceRGB';
        this._setColorSpace(space, stroke);
        color = color.join(' ');
        this.addContent(color + " " + op);
      }
      return true;
    },
    _setColorSpace: function(space, stroke) {
      var op;
      op = stroke ? 'CS' : 'cs';
      return this.addContent("/" + space + " " + op);
    },
    fillColor: function(color, opacity) {
      var set;
      set = this._setColor(color, false);
      if (set && (opacity != null)) {
        this.fillOpacity(opacity);
      }
      return this;
    },
    strokeColor: function(color, opacity) {
      var set;
      set = this._setColor(color, true);
      if (set && (opacity != null)) {
        this.strokeOpacity(opacity);
      }
      return this;
    },
    opacity: function(opacity) {
      this._doOpacity(opacity, opacity);
      return this;
    },
    fillOpacity: function(opacity) {
      this._doOpacity(opacity, null);
      return this;
    },
    strokeOpacity: function(opacity) {
      this._doOpacity(null, opacity);
      return this;
    },
    _doOpacity: function(fillOpacity, strokeOpacity) {
      var dictionary, id, key, name, ref1;
      if (!(fillOpacity || strokeOpacity)) {
        return;
      }
      fillOpacity = Math.max(0, Math.min(1, fillOpacity));
      strokeOpacity = Math.max(0, Math.min(1, strokeOpacity));
      key = fillOpacity + "_" + strokeOpacity;
      if (this._opacityRegistry[key]) {
        ref1 = this._opacityRegistry[key], dictionary = ref1[0], name = ref1[1];
      } else {
        dictionary = {
          Type: 'ExtGState'
        };
        if (fillOpacity) {
          dictionary.ca = fillOpacity;
        }
        if (strokeOpacity) {
          dictionary.CA = strokeOpacity;
        }
        dictionary = this.ref(dictionary);
        id = ++this._opacityCount;
        name = "Gs" + id;
        this._opacityRegistry[key] = [dictionary, name];
      }
      this.page.ext_gstates[name] = dictionary;
      return this.addContent("/" + name + " gs");
    },
    linearGradient: function(x1, y1, x2, y2) {
      return new PDFLinearGradient(this, x1, y1, x2, y2);
    },
    radialGradient: function(x1, y1, r1, x2, y2, r2) {
      return new PDFRadialGradient(this, x1, y1, r1, x2, y2, r2);
    }
  };

  namedColors = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };

}).call(this);
