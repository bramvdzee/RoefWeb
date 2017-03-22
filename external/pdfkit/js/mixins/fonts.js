// Generated by CoffeeScript 1.12.4
(function() {
  var PDFFont;

  PDFFont = require('../font');

  module.exports = {
    initFonts: function() {
      this._fontFamilies = {};
      this._fontCount = 0;
      this._fontSize = 12;
      this._font = null;
      this._registeredFonts = {};
      return this.font('Helvetica');
    },
    font: function(filename, family, size) {
      var id, ref;
      if (typeof family === 'number') {
        size = family;
        family = null;
      }
      if (this._registeredFonts[filename]) {
        ref = this._registeredFonts[filename], filename = ref.filename, family = ref.family;
      }
      if (size != null) {
        this.fontSize(size);
      }
      if (family == null) {
        family = filename;
      }
      if (this._fontFamilies[family]) {
        this._font = this._fontFamilies[family];
        return this;
      }
      id = 'F' + (++this._fontCount);
      this._font = new PDFFont(this, filename, family, id);
      this._fontFamilies[family] = this._font;
      return this;
    },
    fontSize: function(_fontSize) {
      this._fontSize = _fontSize;
      return this;
    },
    currentLineHeight: function(includeGap) {
      if (includeGap == null) {
        includeGap = false;
      }
      return this._font.lineHeight(this._fontSize, includeGap);
    },
    registerFont: function(name, path, family) {
      this._registeredFonts[name] = {
        filename: path,
        family: family
      };
      return this;
    },
    embedFonts: function(fn) {
      var family, font, fonts, proceed;
      fonts = (function() {
        var ref, results;
        ref = this._fontFamilies;
        results = [];
        for (family in ref) {
          font = ref[family];
          results.push(font);
        }
        return results;
      }).call(this);
      return (proceed = (function(_this) {
        return function() {
          if (fonts.length === 0) {
            return fn();
          }
          return fonts.shift().embed(proceed);
        };
      })(this))();
    }
  };

}).call(this);
