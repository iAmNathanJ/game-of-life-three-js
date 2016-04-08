'use strict';

window.$_life = function (liveRangeLow, liveRangeHigh, birthNum) {

  'use strict';

  var _Rand = Math.random;
  var _Round = Math.round;

  var mappable = function mappable(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
      arr.push(0);
    }
    return arr;
  };

  var populate = function populate(el) {
    return _Round(_Rand());
  };

  var liveOrDie = function liveOrDie(y, x, z, state) {

    var walk = function walk(cb) {
      for (var _y = -1; _y <= 1; _y++) {
        for (var _x = -1; _x <= 1; _x++) {
          for (var _z = -1; _z <= 1; _z++) {
            if (_y === 0 && _x === 0 && _z === 0) continue;
            cb(_y, _x, _z);
          }
        }
      }
    };

    var grab = function grab(arr, y, x, z) {
      if (!arr[y]) return 0;
      if (!arr[y][x]) return 0;
      return arr[y][x][z] || 0;
    };

    var thisCellIsAlive = state[y][x][z];

    var liveNeighbors = 0;
    walk(function (offsetY, offsetX, offsetZ) {
      if (grab(state, y + offsetY, x + offsetX, z + offsetZ)) liveNeighbors++;
    });

    if (thisCellIsAlive) {
      return liveNeighbors >= liveRangeLow && liveNeighbors <= liveRangeHigh ? 1 : 0;
    } else {
      return liveNeighbors === birthNum ? 1 : 0;
    }
  };

  return {
    setLiveRangeLow: function setLiveRangeLow(num) {
      return liveRangeLow = num;
    },
    setLiveRangeHigh: function setLiveRangeHigh(num) {
      return liveRangeHigh = num;
    },
    setBirthNum: function setBirthNum(num) {
      return birthNum = num;
    },


    state: [],

    seed: function seed(height, width, depth) {
      this.state = mappable(height).map(function (y) {
        return mappable(width).map(function (x) {
          return mappable(depth).map(populate);
        });
      });
    },
    generate: function generate() {
      var _this = this;

      return this.state = this.state.map(function (row, y) {
        return row.map(function (col, x) {
          return col.map(function (cell, z) {
            return liveOrDie(y, x, z, _this.state);
          });
        });
      });
    }
  };
};