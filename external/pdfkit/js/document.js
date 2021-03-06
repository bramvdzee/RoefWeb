// Generated by CoffeeScript 1.12.4

/*
PDFDocument - represents an entire PDF document
By Devon Govett
 */

(function() {
  var PDFDocument, PDFObject, PDFObjectStore, PDFPage, PDFReference, fs;

  fs = require('fs');

  PDFObjectStore = require('./store');

  PDFObject = require('./object');

  PDFReference = require('./reference');

  PDFPage = require('./page');

  PDFDocument = (function() {
    var mixin;

    function PDFDocument(options1) {
      var key, ref1, val;
      this.options = options1 != null ? options1 : {};
      this.version = 1.3;
      this.compress = true;
      this.store = new PDFObjectStore;
      this.pages = [];
      this.page = null;
      this.initColor();
      this.initVector();
      this.initFonts();
      this.initText();
      this.initImages();
      this._info = this.ref({
        Producer: 'PDFKit',
        Creator: 'PDFKit',
        CreationDate: new Date()
      });
      this.info = this._info.data;
      if (this.options.info) {
        ref1 = this.options.info;
        for (key in ref1) {
          val = ref1[key];
          this.info[key] = val;
        }
        delete this.options.info;
      }
      this.addPage();
    }

    mixin = function(name) {
      var method, methods, results;
      methods = require('./mixins/' + name);
      results = [];
      for (name in methods) {
        method = methods[name];
        results.push(PDFDocument.prototype[name] = method);
      }
      return results;
    };

    mixin('color');

    mixin('vector');

    mixin('fonts');

    mixin('text');

    mixin('images');

    mixin('annotations');

    mixin('tables');

    PDFDocument.prototype.addPage = function(options) {
      if (options == null) {
        options = this.options;
      }
      this.page = new PDFPage(this, options);
      this.store.addPage(this.page);
      this.pages.push(this.page);
      this.x = this.page.margins.left;
      this.y = this.page.margins.top;
      this._ctm = [1, 0, 0, 1, 0, 0];
      this.transform(1, 0, 0, -1, 0, this.page.height);
      return this;
    };

    PDFDocument.prototype.ref = function(data) {
      return this.store.ref(data);
    };

    PDFDocument.prototype.addContent = function(str) {
      this.page.content.add(str);
      return this;
    };

    PDFDocument.prototype.write = function(filename, fn) {
      return this.output(function(out) {
        return fs.writeFile(filename, out, 'binary', fn);
      });
    };

    PDFDocument.prototype.output = function(fn) {
      return this.finalize((function(_this) {
        return function() {
          var out;
          out = [];
          _this.generateHeader(out);
          return _this.generateBody(out, function() {
            var i, k, len1, ret;
            _this.generateXRef(out);
            _this.generateTrailer(out);
            ret = '';
            for (i = 0, len1 = out.length; i < len1; i++) {
              k = out[i];
              ret += k + '\n';
            }
            return fn(ret);
          });
        };
      })(this));
    };

    PDFDocument.prototype.finalize = function(fn) {
      var key, ref1, val;
      ref1 = this.info;
      for (key in ref1) {
        val = ref1[key];
        if (typeof val === 'string') {
          this.info[key] = PDFObject.s(val);
        }
      }
      return this.embedFonts((function(_this) {
        return function() {
          return _this.embedImages(function() {
            var cb, done, i, len1, page, ref2, results;
            done = 0;
            cb = function() {
              if (++done === _this.pages.length) {
                return fn();
              }
            };
            ref2 = _this.pages;
            results = [];
            for (i = 0, len1 = ref2.length; i < len1; i++) {
              page = ref2[i];
              results.push(page.finalize(cb));
            }
            return results;
          });
        };
      })(this));
    };

    PDFDocument.prototype.generateHeader = function(out) {
      out.push("%PDF-" + this.version);
      out.push("%\xFF\xFF\xFF\xFF\n");
      return out;
    };

    PDFDocument.prototype.generateBody = function(out, fn) {
      var id, offset, proceed, ref, refs;
      offset = out.join('\n').length;
      refs = (function() {
        var ref1, results;
        ref1 = this.store.objects;
        results = [];
        for (id in ref1) {
          ref = ref1[id];
          results.push(ref);
        }
        return results;
      }).call(this);
      return (proceed = (function(_this) {
        return function() {
          if (ref = refs.shift()) {
            return ref.object(_this.compress, function(object) {
              ref.offset = offset;
              out.push(object);
              offset += object.length + 1;
              return proceed();
            });
          } else {
            _this.xref_offset = offset;
            return fn();
          }
        };
      })(this))();
    };

    PDFDocument.prototype.generateXRef = function(out) {
      var id, len, offset, ref, ref1, results;
      len = this.store.length + 1;
      out.push("xref");
      out.push("0 " + len);
      out.push("0000000000 65535 f ");
      ref1 = this.store.objects;
      results = [];
      for (id in ref1) {
        ref = ref1[id];
        offset = ('0000000000' + ref.offset).slice(-10);
        results.push(out.push(offset + ' 00000 n '));
      }
      return results;
    };

    PDFDocument.prototype.generateTrailer = function(out) {
      var trailer;
      trailer = PDFObject.convert({
        Size: this.store.length,
        Root: this.store.root,
        Info: this._info
      });
      out.push('trailer');
      out.push(trailer);
      out.push('startxref');
      out.push(this.xref_offset);
      return out.push('%%EOF');
    };

    PDFDocument.prototype.toString = function() {
      return "[object PDFDocument]";
    };

    return PDFDocument;

  })();

  module.exports = PDFDocument;

}).call(this);
