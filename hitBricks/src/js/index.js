// 代码风格，随意而写：
var screen = document.body.getBoundingClientRect();
var MSG = document.querySelector('.msg');
var AGAIN = document.querySelector('.again');
var FOLLOW = document.querySelector('.follow');
var ALERT = document.querySelector('.alert');
var HEIGHT = screen.height;
var WIDTH = screen.width;
var MARGINTOP = 1;  // 上边距
var MARGINLEFT = 1;  // 左边距
var SPACE = 32;
var ENTER = 13;
var UP = 38;
var LEFT = 37;
var RIGHT = 39;
var DOWN = 40;
var SUM = 0; // 打掉砖块数
var INDEX = 0; // 砖块模板
var curModel = window.brickModel[INDEX];

// 砖块宽高 & 颜色
var bW = (WIDTH - (curModel[0].length) * 2) / curModel[0].length ; // 减去每一个左右间距为1
var bH = (HEIGHT - (curModel.length) * 2) / 2 / curModel.length ; // 宽高成等比例
var bricks = []; // 所有砖块
var bricksColors = {
  1: 'rgb(153,209,210)',// 正常砖块 标识 1
  2: 'rgba(255, 53, 85, 0.88)', // 加速砖块 标识 2
  3: 'rgba(28, 179, 26, 0.41)', // 减速砖块 标识 3
  4: 'rgba(0, 153, 235, 0.55)', // 加长模板 标识 4
  5: 'rgba(170, 172, 184, 0.72)', // 缩短模板 标识 5
  6: 'rgba(156, 39, 176, 0.72)', // 消除 标识 6
  7: 'rgba(255, 235, 59, 0.5)', // 返回起点 标识 7
}
var messageMap = { // 提示
  2: 'SPEED!', // 加速砖块 标识 2
  3: 'LAZY!', // 减速砖块 标识 3
  4: 'LONG!', // 加长模板 标识 4
  5: 'SHORT', // 缩短模板 标识 5
  6: 'BOOM!', // 消除 标识 6
  7: 'RETURN', // 返回起点 标识 7
}

// 木头宽高 & 初始坐标 & 颜色
var w = {
  w: WIDTH / 5,
  h: bH / 2,
  x: WIDTH / 2 - WIDTH / 5 /2,
  y: HEIGHT - bH / 2,
  colors: 'rgb(243,179,108)'
}

// 球半径 & 初始圆心坐标 & 颜色 & 运动数据
var c = {
  r: bH / 4,
  x: w.x + w.w / 2,
  y: w.y - bH / 4,
  colors: 'rgb(229,71,70)',
  xs: 2, // x 速度
  ys: 2, // y 速度
  reset: false // effect 回到起点
}

var canvas = document.getElementById('canvas');
var cxt = canvas.getContext('2d');
canvas.height = HEIGHT;
canvas.width = WIDTH;

// API兼容
window.animationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.msRequestAnimationFrame    ||
          window.oRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// 初始化
function init(cxt, noChangeBricks){ // 第二个参数代表不重置砖块
  clearAll(cxt);
  if(!noChangeBricks){
    initBrick(cxt, curModel);
  }
  drawBrick(cxt, bricks);
  drawWood(cxt, w);
  drawGlobe(cxt, c);
}

// 动画开始
function go(cxt){
  animationFrame(function(){
    clearAll(cxt);
    drawBrick(cxt, bricks);

    runingWood(cxt, w);
    runingGlobe(cxt, c);
    if(bricks.length===0){
      nextModel();
    }
    if(window.canGo){
      go(cxt);
    }
  })
}

// 恢复木块与小球位置
function resetCirAndWood(){
  // 初始化木块位置
  w.w = WIDTH / 5;
  w.h = bH / 2;
  w.x = WIDTH / 2 - WIDTH / 5 /2;
  w.y = HEIGHT - bH / 2;
  // 初始化球位置
  c.x = w.x + w.w / 2;
  c.y = w.y - bH / 4;
}

// 下一关
function nextModel(){
  window.canGo = false;
  curModel = window.brickModel[++ INDEX];
  if(!curModel){ // 没有模板了从第一个开始
    INDEX = 0;
    curModel = window.brickModel[INDEX];
  }
  resetCirAndWood();
  init(cxt);
}

// 清空
function clearAll(cxt){
  cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
}

// 砖块绘制
function drawBrick(cxt,bricks){
  for (var i = 0; i < bricks.length; i++) {
    var brick = bricks[i];
    rect(cxt, brick.x + MARGINLEFT, brick.y + MARGINTOP, brick.w, brick.h, brick.color);
  }
}

// 初始化砖块数量和坐标
function initBrick(cxt, model){
  if(bricks.length > 0)return; // 只添加一次
  var y = 0;
  var x = 0;
  for(var i = 0; i < model.length; i ++){
    var row = model[i];
    for(var j = 0; j < row.length; j ++){
      var brick = row[j];
      if(brick){
        bricks.push({
          x: x + MARGINLEFT,
          y: y + MARGINTOP,
          w: bW,
          h: bH,
          color: bricksColors[brick]
        });
      }
      x += bW + 2;
    }
    x = 0;
    y += bH + 2; // 方块上下间隔一像素
  }
  y = 0;
}

// 绘制木板
function drawWood(cxt, w){
  rect(cxt, w.x, w.y, w.w, w.h, w.colors);
}

// 绘制球
function drawGlobe(cxt, c){
  circle(cxt, c.x, c.y, c.r, c.colors);
}

// 木头运动处理
function runingWood(cxt, w){
  drawWood(cxt, w);
}

// 球的运动处理
function runingGlobe(cxt,c){
  c.x += c.xs;
  c.y -= c.ys;

  collisionOf(c,w, function(){
    if(c.reset){ // 上一次打到了回到起点的效果
      c.reset = false;
      window.canGo = false;
      resetCirAndWood();
      init(cxt, 'noChangeBricks');
      return;
    }
  });
  collisionWall(c);

  for(var i = 0; i < bricks.length; i++){
    var brick = bricks[i];
    var isCollisioned = false;
    collisionOf(c, brick, function(){
      isCollisioned = true;
      SUM += 1;
      bricks.splice(i, 1);
      brickEffect(brick.color);
    });
    if(isCollisioned){
      break;
    }
  }
  drawGlobe(cxt, c);
}

// 提示信息
function flyAlert(color){
  if(color === bricksColors[1])return; // 默认颜色不提示
  for(var flag in bricksColors){
    if(color === bricksColors[flag])break;
  }
  console.log(flag)
  ALERT.innerHTML = messageMap[flag];
  ALERT.style.color = bricksColors[flag];
  ALERT.classList.toggle('reverse');
}

// 处理砖块种类效果
function brickEffect(color){
  flyAlert(color); // 提示信息
  switch (color) {
    case bricksColors[2]:
      speed(c);
      break;
    case bricksColors[3]:
      lazy(c);
      break;
    case bricksColors[4]:
      long(w);
      break;
    case bricksColors[5]:
      short(w);
      break;
    case bricksColors[6]:
      boom();
      break;
    case bricksColors[7]:
      reset(c);
      break;
  }

  // 加速2倍
  function speed(c){
    c.xs *= 2;
    c.ys *= 2;
    setTimeout(function(){
      c.xs /= 2;
      c.ys /= 2;
    },7000)
  }

  // 减速2倍
  function lazy(c){
    c.xs /= 2;
    c.ys /= 2;
    setTimeout(function(){
      c.xs *= 2;
      c.ys *= 2;
    },7000)
  }

  // 加长模板1.5倍
  function long(w){
    var l = w.w * 1.5;
    var pre = l - w.w;
    w.w = l;
    w.x -= pre / 2;
    setTimeout(function(){
      var l = w.w / 1.5;
      var pre = w.w - l;
      w.w = l;
      w.x += pre / 2;
    },7000)
  }

  // 缩短模板
  function short(w){
    var l = w.w / 1.5;
    var pre = w.w - l;
    w.w = l;
    w.x += pre / 2;
    setTimeout(function(){
      var l = w.w * 1.5;
      var pre = l - w.w;
      w.w = l;
      w.x -= pre / 2;
    },7000)
  }

  // 随机删除
  function boom(){
    if(bricks.length < 2)return; // 最少两个
    var num = Math.floor(bricks.length / 2); // 消除个数
    rm();
    function rm(){
      animationFrame(function(){
        bricks.splice(random(), 1);
        SUM++;
        if(--num){
          rm();
        }
      })
    }
    function random(){// 取一个 0 到 bricks.length - 1 作为索引
      var len = bricks.length - 1;
      return Math.round(
        Math.random() * len
      )
    }
  }

  // 回到起点
  function reset(){
    c.reset = true;
  }
}

// 处理碰撞除墙壁外的物体
function collisionOf(c, w, cb){
  var r = c.r;
  if(c.x + r > w.x && c.x - r < w.x + w.w && c.y + r > w.y && c.y - r < w.y + w.h){ // 碰撞到了
    var top = c.y + r - w.y; //与木头顶边距离
    var left = c.x + r - w.x; //与木头左边距离
    var right = w.x + w.w - c.x + r; //与木头右边距离
    var bottom = w.y + w.h - c.y + r; // 与木头底边距离
    var min = Math.min(bottom,left,right,top);
    console.log({
      top:top,
      bottom:bottom,
      left:left,
      right:right
    })
    if(min === top){ // 底边
      c.ys = -c.ys;
      c.y = w.y - r;
    }else if(min === bottom){ // 底
      c.ys = -c.ys;
      c.y = w.y + w.h + r;
    }else if(min === left){ // 左
      c.xs = -c.xs;
      c.x = w.x - r;
    }else if(min === right){ // 右
      c.xs = -c.xs;
      c.x = w.x + w.w + r;
    }
    cb && cb();
  }
}

// 处理碰撞墙壁
function collisionWall(c){
  var r = c.r;
  if( c.y - r < 0){
    c.ys = -c.ys;
    c.y = 0 + r;
  }else if(c.y + r > HEIGHT){
    c.ys = -c.ys;
    c.y = HEIGHT - r;
    over();
  }
  if(c.x - r < 0){
    c.xs = -c.xs;
    c.x = 0 + r;
  }else if(c.x + r > WIDTH){
    c.xs = -c.xs;
    c.x = WIDTH - r;
  }
}

// 绘制矩形
function rect(cxt, x1, y1, x2, y2, color){
  cxt.beginPath();
  cxt.rect(x1, y1, x2, y2);
  cxt.fillStyle = color || 'black';
  cxt.fill()
}

// 绘制圈
function circle(cxt, x, y, r, color) {
    cxt.beginPath();
    cxt.arc(x, y, r, 0, 2 * Math.PI, false);
    cxt.fillStyle = color;
    cxt.fill();
}

// 结束
function over(){
  window.canGo = false;
  cancelEvent();
  var str = '';
  if(SUM<20){
    str = '我仅仅打掉了' + SUM + '个砖块，加加油！';
  }else if(SUM<40){
    str = '我仅打掉了' + SUM + '个砖块，加油！';
  }else if(SUM<60){
    str = '我打掉了' + SUM + '个砖块，快可以做点什么了';
  }else if(SUM<80){
    str = '我打掉了' + SUM + '个砖块，可以为汪星人盖一个家';
  }else if(SUM<100){
    str = '我打掉了' + SUM + '个砖块，可以盖一个洗手间';
  }else if(SUM<120){
    str = '我打掉了' + SUM + '个砖块，可以盖一个单人间';
  }else if(SUM<140){
    str = '我打掉了' + SUM + '个砖块，可以盖一个双人间';
  }else if(SUM<160){
    str = '我打掉了' + SUM + '个砖块，可以盖一个三人间';
  }else if(SUM>=180){
    str = '我打掉了' + SUM + '个砖块，可以盖一个温暖的家';
  }
  document.title = str;
  MSG.innerHTML = str;
  MSG.classList.remove('hide');
  AGAIN.classList.remove('hide');
}

// 事件列表
var eventMap = {
  goUp:function (e){
    if(e.keyCode === UP || e === 'touch'){
      if(window.canGo)return;
      window.canGo=true;
      go(cxt);
    }
  },
  goLeft:function (e){
    if(e.keyCode === LEFT || e === 'touch'){
      if(w.x <= 0)return;
      w.x -= w.w * 0.4;
      if(!window.canGo){
        c.x -= w.w * 0.4;
        init(cxt);
      };
    }
  },
  goRight:function (e){
    if(e.keyCode === RIGHT || e === 'touch'){
      if(w.x + w.w >= WIDTH)return;
      w.x += w.w * 0.4;
      if(!window.canGo){
        c.x += w.w * 0.4;
        init(cxt);
      };
    }
  },
  stop:function(e){
    if(e.keyCode === DOWN){
      window.canGo=false;
    }
  },
  touch:function(e){
    var x = e.changedTouches[0].pageX;
    var y = e.changedTouches[0].pageY;
    if(y > HEIGHT / 2){ // 下半屏幕
      if(x > WIDTH / 2){ // 左右移动
        eventMap.goRight('touch');
      }else{
        eventMap.goLeft('touch');
      }
    }else{
      if(!window.canGo){ // 没有运行的时候才可以更改发射方向
        if(x > WIDTH / 2){ // 右上屏幕  左右发射方向
          if(c.xs < 0){ // 本应该向右 大于零
            c.xs *= -1;
          }
        }else{ // 左上屏幕
          if(c.xs > 0){ // 本应该向左 小于零
            c.xs *= -1;
          }
        }
      }
      eventMap.goUp('touch');
    }
  }
}
// 事件绑定
function bindEvent(cxt) {
  // 移动端
  canvas.addEventListener('touchend', eventMap.touch);
  // 键盘按下
  ['goUp', 'stop', 'goLeft', 'goRight'].forEach(function(item){
    document.body.addEventListener('keydown', eventMap[item]);
  });
  // 再来一次
  AGAIN.addEventListener('click',function(){
    window.location.href = window.location.href + '?_=' + Date.now();
  })
  // 取消指引
  FOLLOW.addEventListener('click',function(){
    this.classList.add('hide');
  })
}

// 取消事件监听
function cancelEvent(){
  // 移动端
  canvas.removeEventListener('touchend', eventMap.touch);
  // 键盘按下
  ['goUp', 'stop', 'goLeft', 'goRight'].forEach(function(item){
    document.body.removeEventListener('keydown', eventMap[item]);
  });
}

// pc不显示指引
;(function(){
  if(!/Mobile/i.test(navigator.userAgent)){
    FOLLOW.classList.add('hide');
    window.ontouchstart = function(e) { e.preventDefault(); };
  }
})();

// 加载开始 微信DOMContentLoaded和load事件导致页面canvas有时加载白屏
setTimeout(function(){
  init(cxt);
  bindEvent(cxt);
},100)
