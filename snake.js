function Game(o) {
  this.grid = new Grid(o.h, o.w);
  this.snake = new Snake(o.w/2, o.h/2);
  return this;
}

Game.prototype.toHtml = function() {
  var isMac = navigator.userAgent.match('Macintosh');
  return this.toArray().map(function(row){
    return '<ul>'+row.map(function(cell){
      var kls = '';
      switch(cell) {
        case 'A':
          kls = 'apple';
          if(isMac) {
            cell = '\uF8FF';
          }
          break;
        case 'N':
          kls = 'snake north';
          cell = '\u2191';
          break;
        case 'S':
          kls = 'snake south';
          cell = '\u2193';
          break;
        case 'E':
          kls = 'snake east';
          cell = '\u2192';
          break;
        case 'W':
          kls = 'snake west';
          cell = '\u2190';
          break;
        case 'T':
          kls = 'snake tail';
          break;
        default:
          cell = '-';
      }
      return '<li class="'+kls+'">'+cell+'</li>';
    }).join('')+'</ul>';
  }).join('\n');
};



Game.prototype.toArray = function() {
  var copy = this.grid.rows.slice(0).map(function(row){
    return row.slice(0);
  });
  copy[this.snake.y][this.snake.x] = this.snake.bearing;
  for (var i = 0; i < this.snake.tail.length; i++) {
    var t = this.snake.tail[i];
    copy[t.y][t.x] = 'T';
  };
  return copy;
};




Game.prototype.isOver = function() {
  return ( (this.snake.x > this.grid.w-1)
        || (this.snake.y > this.grid.h-1)
        || (this.snake.y < 0)
        || (this.snake.x < 0)
        || (this.snake.collideSelf())
  );
};

Game.prototype.iterate = function(bearing) {
  if(this.snake.isOnApple(this.grid)) {

    // remove the apple
    this.grid.apples--;
    this.grid.rows[this.snake.y][this.snake.x] = '';

    // increase difficulty
    this.snake.grow();

  }
  else if(!this.grid.apples) {
    this.grid.level++;
    this.grid.addRandomApples(0.02, 0.03);
  }

  this.snake.updateBearing(bearing)
  this.snake.move();
};


function Grid(h, w) {
  this.h = h;
  this.w = w;
  this.rows = [];
  this.apples = 0;
  this.level = 1;
  for (var i = 0; i < h; i++) {
    var row = [];
    for (var j = 0; j < w; j++) {
      row.push(null);
    };
    this.rows.push(row);
  };

  this.addRandomApples(0.01, 0.02);

  return this;
}

Grid.prototype.addRandomApples = function(min, max) {
  var size = this.w * this.h;
  min = (min || 0) * size;
  max = (max || 1) * size;

  // how many apples do we want?
  var a = Math.floor(Math.random() * (max - min) + min);

  for (var i = 0; i < a; i++) {
    var x = Math.floor(Math.random() * this.w)
      , y = Math.floor(Math.random() * this.h);
    this.rows[y][x] = 'A';
  };

  // how many apples this we actually add ?
  var count = 0;
  for (var i = this.rows.length - 1; i >= 0; i--) {
    var m = this.rows[i].join('').match(/A/g);
    count += ( m ? m.length : 0 );
  }

  this.apples = count;
};


function Snake(x, y) {
  this.x = Math.floor(x);
  this.y = Math.floor(y);
  this.bearing = 'N';
  this.tail = [];
  return this;
}

Snake.prototype.isOnApple = function(grid) {
  return grid.rows[this.y][this.x] === 'A';
};

Snake.prototype.updateBearing = function(bearing) {
 var validBearings = {N:1,S:1,E:1,W:1};
  //prevent suicide
  switch(this.bearing) {
    case 'N':
      delete validBearings.S;
      break;
    case 'S':
      delete validBearings.N;
      break;
    case 'E':
      delete validBearings.W;
      break;
    case 'W':
      delete validBearings.E;
      break;
  }

  if(validBearings[bearing]) {
    this.bearing = bearing;
  }
};

Snake.prototype.move = function() {

  if(this.tail.length) {
    this.tail.shift();
    this.tail.push({x:this.x, y:this.y});
  }
  switch(this.bearing) {
    case 'N':
      this.y--;
      break;
    case 'S':
      this.y++;
      break;
    case 'E':
      this.x++;
      break;
    case 'W':
      this.x--;
      break;
  }
};

Snake.prototype.grow = function() {
  this.tail.push({x:this.x, y:this.y});
};

Snake.prototype.collideSelf = function() {
  for (var i = this.tail.length - 1; i >= 0; i--) {
    var t = this.tail[i]
    if (this.x === t.x && this.y === t.y) {
      return true;
    }
  }
};
