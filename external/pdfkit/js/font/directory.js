// Generated by CoffeeScript 1.12.4
(function() {
  var Data, Directory,
    slice = [].slice;

  Data = require('../data');

  Directory = (function() {
    var checksum;

    function Directory(data) {
      var entry, i, j, ref;
      this.scalarType = data.readInt();
      this.tableCount = data.readShort();
      this.searchRange = data.readShort();
      this.entrySelector = data.readShort();
      this.rangeShift = data.readShort();
      this.tables = {};
      for (i = j = 0, ref = this.tableCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        entry = {
          tag: data.readString(4),
          checksum: data.readInt(),
          offset: data.readInt(),
          length: data.readInt()
        };
        this.tables[entry.tag] = entry;
      }
    }

    Directory.prototype.encode = function(tables) {
      var adjustment, directory, directoryLength, entrySelector, headOffset, log2, offset, rangeShift, searchRange, sum, table, tableCount, tableData, tag;
      tableCount = Object.keys(tables).length;
      log2 = Math.log(2);
      searchRange = Math.floor(Math.log(tableCount) / log2) * 16;
      entrySelector = Math.floor(searchRange / log2);
      rangeShift = tableCount * 16 - searchRange;
      directory = new Data;
      directory.writeInt(this.scalarType);
      directory.writeShort(tableCount);
      directory.writeShort(searchRange);
      directory.writeShort(entrySelector);
      directory.writeShort(rangeShift);
      directoryLength = tableCount * 16;
      offset = directory.pos + directoryLength;
      headOffset = null;
      tableData = [];
      for (tag in tables) {
        table = tables[tag];
        directory.writeString(tag);
        directory.writeInt(checksum(table));
        directory.writeInt(offset);
        directory.writeInt(table.length);
        tableData = tableData.concat(table);
        if (tag === 'head') {
          headOffset = offset;
        }
        offset += table.length;
        while (offset % 4) {
          tableData.push(0);
          offset++;
        }
      }
      directory.write(tableData);
      sum = checksum(directory.data);
      adjustment = 0xB1B0AFBA - sum;
      directory.pos = headOffset + 8;
      directory.writeUInt32(adjustment);
      return new Buffer(directory.data);
    };

    checksum = function(data) {
      var i, j, ref, sum, tmp;
      data = slice.call(data);
      while (data.length % 4) {
        data.push(0);
      }
      tmp = new Data(data);
      sum = 0;
      for (i = j = 0, ref = data.length; j < ref; i = j += 4) {
        sum += tmp.readUInt32();
      }
      return sum & 0xFFFFFFFF;
    };

    return Directory;

  })();

  module.exports = Directory;

}).call(this);