function Game(o) {
  this.grid = new Grid(o.h, o.w);
  for (var i = 0; i < (o.apples || 2); i++) {
    this.grid.addApple();
  };
  this.snake = new Snake(o.w/2, o.h/2);
  return this;
}


Game.prototype.toText = function() {
  return this.toArray().map(function(row){
    return row.map(function(cell){
      return cell || '\u00B7';
    }).join('');
  }).join('\n');
};

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
  this.snake.addTo(copy);
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
  );
};

Game.prototype.iterate = function(bearing) {
  if(this.snake.isOnApple(this.grid)) {
    this.grid.rows[this.snake.y][this.snake.x] = '';
    this.snake.grow();
  }
  this.snake.move(bearing);
};




function Grid(h, w) {
  this.h = h;
  this.w = w;
  this.rows = [];
  for (var i = 0; i < h; i++) {
    var row = [];
    for (var j = 0; j < w; j++) {
      row.push(null);
    };
    this.rows.push(row);
  };
  return this;
}

Grid.prototype.addApple = function(count) {
  var x = Math.floor(Math.random() * this.w)
    , y = Math.floor(Math.random() * this.h);
  this.rows[y][x] = 'A';
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

Snake.prototype.move = function(bearing) {
  if({N:1,S:1,E:1,W:1}[bearing]) {
    this.bearing = bearing;
  }
  var p = {x:this.x, y:this.y};
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
  if(this.tail.length) {
    this.tail.shift();
    this.tail.push(p);
  }
};

Snake.prototype.addTo = function(rows) {
  rows[this.y][this.x] = this.bearing;
};

Snake.prototype.grow = function() {
  this.tail.push({x:this.x, y:this.y});
};
