// Generated by CoffeeScript 1.12.4

/*
PDFReference - represents a reference to another object in the PDF object heirarchy
By Devon Govett
 */

(function() {
  var PDFObject, PDFReference, zlib;

  zlib = require('zlib');

  PDFReference = (function() {
    function PDFReference(id, data1) {
      this.id = id;
      this.data = data1 != null ? data1 : {};
      this.gen = 0;
      this.stream = null;
      this.finalizedStream = null;
    }

    PDFReference.prototype.object = function(compress, fn) {
      var out;
      if (this.finalizedStream == null) {
        return this.finalize(compress, (function(_this) {
          return function() {
            return _this.object(compress, fn);
          };
        })(this));
      }
      out = [this.id + " " + this.gen + " obj"];
      out.push(PDFObject.convert(this.data));
      if (this.stream) {
        out.push("stream");
        out.push(this.finalizedStream);
        out.push("endstream");
      }
      out.push("endobj");
      return fn(out.join('\n'));
    };

    PDFReference.prototype.add = function(s) {
      if (this.stream == null) {
        this.stream = [];
      }
      return this.stream.push(Buffer.isBuffer(s) ? s.toString('binary') : s);
    };

    PDFReference.prototype.finalize = function(compress, fn) {
      var data, i;
      if (compress == null) {
        compress = false;
      }
      if (this.stream) {
        data = this.stream.join('\n');
        if (compress && !this.data.Filter) {
          data = new Buffer((function() {
            var j, ref, results;
            results = [];
            for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
              results.push(data.charCodeAt(i));
            }
            return results;
          })());
          return zlib.deflate(data, (function(_this) {
            return function(err, compressedData) {
              if (err) {
                throw err;
              }
              _this.finalizedStream = compressedData.toString('binary');
              _this.data.Filter = 'FlateDecode';
              _this.data.Length = _this.finalizedStream.length;
              return fn();
            };
          })(this));
        } else {
          this.finalizedStream = data;
          this.data.Length = this.finalizedStream.length;
          return fn();
        }
      } else {
        this.finalizedStream = '';
        return fn();
      }
    };

    PDFReference.prototype.toString = function() {
      return this.id + " " + this.gen + " R";
    };

    return PDFReference;

  })();

  module.exports = PDFReference;

  PDFObject = require('./object');

}).call(this);
