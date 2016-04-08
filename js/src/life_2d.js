'use strict';

const _Rand = Math.random;
const _Round = Math.round;

const mappable = (len) => {
  let arr = [];
  for(let i = 0; i < len; i++) {
    arr.push(0);
  }
  return arr;
};

const populate = (acc) => acc.concat(_Round(_Rand()));

const liveOrDie = (row, cell, state) => {

  const walk = (cb) => {
    for(let y = -1; y <= 1; y++) {
      for(let x = -1; x <= 1; x++) {
        if(y === 0 && x === 0) continue;
        cb(x, y);
      }
    }
  };

  const grab = (arr, i, j) => {
    if(!arr[i]) return 0;
    return arr[i][j] || 0;
  };

  let thisCellIsAlive = state[row][cell];

  let liveNeighbors = 0;
  walk(function(x, y) {
    if(grab(state, row+y, cell+x)) liveNeighbors++;
  });

  if(thisCellIsAlive) {
    return (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
  } else {
    return (liveNeighbors === 3) ? 1 : 0;
  }
};


window.$_life = function() {

  return {

    state: [],

    seed(rows, cols) {
      this.state = mappable(rows).map(row => {
        return mappable(cols).reduce(populate, []);
      });
    },

    generate() {
      return this.state = this.state.map((row, y) => {
        return row.map((cell, x) => {
          return liveOrDie(y, x, this.state);
        });
      });
    }
  };

};
