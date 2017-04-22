window.$_life = function(liveRangeLow, liveRangeHigh, birthNum) {

  const _Rand = Math.random;
  const _Round = Math.round;

  const mappable = (len) => {
    let arr = [];
    for(let i = 0; i < len; i++) {
      arr.push(0);
    }
    return arr;
  };

  const populate = (el) => _Round(_Rand());

  const walk = (y, x, z) => (cb) => {
    for(let y = -1; y <= 1; y++) {
      for(let x = -1; x <= 1; x++) {
        for(let z = -1; z <= 1; z++) {
          if(y === 0 && x === 0 && z === 0) continue;
          cb(y, x, z);
        }
      }
    }
  };

  const grab = (arr, y, x, z) => {
    if(!arr[y]) return 0;
    if(!arr[y][x]) return 0;
    return arr[y][x][z] || 0;
  };

  const liveOrDie = (y, x, z, state) => {

    let thisCellIsAlive = state[y][x][z];

    let liveNeighbors = 0;
    walk(y, x, z)((offsetY, offsetX, offsetZ) => {
      if(grab(state, y+offsetY, x+offsetX, z+offsetZ)) liveNeighbors++;
    });

    if(thisCellIsAlive) {
      return (liveNeighbors >= liveRangeLow && liveNeighbors <= liveRangeHigh) ? 1 : 0;
    } else {
      return (liveNeighbors === birthNum) ? 1 : 0;
    }
  };

  return {

    setLiveRangeLow(num) { return liveRangeLow = num; },
    setLiveRangeHigh(num) { return liveRangeHigh = num; },
    setBirthNum(num) { return birthNum = num; },

    state: [],

    seed(height, width, depth) {
      this.state = mappable(height).map(y => {
        return mappable(width).map(x => {
          return mappable(depth).map(populate);
        });
      });
    },

    generate() {
      return this.state = this.state.map((row, y) => {
        return row.map((col, x) => {
          return col.map((cell, z) => {
            return liveOrDie(y, x, z, this.state);
          });
        });
      });
    }
  };

};
