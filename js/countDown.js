var WINDOW_WIDTH = 1024;
var WINDOW_HEIGHT = 768;
var RADIUS = 8;
var MARGIN_TOP = 60;
var MARGIN_LEFT = 30;

//是否显示为时钟, true 则以时钟方式进行计时
var isClock = true;
if(!isClock) {
    var endTime = new Date();
    //设置默认倒计时时间为1小时
    endTime.setTime(endTime.getTime() + (3600 * 1000));
}


var curShowTimeSeconds = getCurrentShowTimeSeconds();
var balls = [];

//时钟显示位置设置
const displayOffsets = {
    hourTen: 0,
    hourUnit: 15,
    colonAfterHour: 30,
    minuteTen: 39,
    minuteUnit: 54,
    colonAfterMinute: 69,
    secondTen: 78,
    secondUnit: 93
};

//小球颜色预定义数组
const colors = ["#33B5E5","#0099CC","#AA66CC","#9933CC","#99CC00","#669900","#FFBB33","#FF8800","#FF4444","#CC0000"];

window.onload = function(){
    //窗口宽度
    WINDOW_WIDTH = document.body.clientWidth;
    //窗口高度
    WINDOW_HEIGHT = document.body.clientHeight;
    //时钟 margin left
    MARGIN_LEFT = Math.round(WINDOW_WIDTH / 10);
    //时钟 margin top
    MARGIN_TOP = Math.round(WINDOW_HEIGHT / 5);
    //小球半径
    RADIUS = Math.round(WINDOW_WIDTH * 4 / 5 / 108) - 1;

    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d');
        canvas.width = WINDOW_WIDTH;
        canvas.height = WINDOW_HEIGHT;
        setInterval(function(){
            render(context);
            update();
        }, 30);
}

/**
 * 更新参数(下一次显示的时间 以及 小球balls 数组的状态)
 */
function update(){
    var nextShowTimeSeconds = getCurrentShowTimeSeconds();
    var nextHours = parseInt(nextShowTimeSeconds / 3600),
        nextMinutes = parseInt((nextShowTimeSeconds - nextHours * 3600) / 60),
        nextSeconds = nextShowTimeSeconds % 60;

    var curHours = parseInt(curShowTimeSeconds / 3600),
        curMinutes = parseInt((curShowTimeSeconds - curHours * 3600) / 60),
        curSeconds = curShowTimeSeconds % 60;

    if(nextSeconds != curSeconds) {
        if(parseInt(curHours / 10) != parseInt(nextHours / 10)){
            addBalls(MARGIN_LEFT + displayOffsets.hourTen * (RADIUS + 1) , MARGIN_TOP, parseInt(curHours/10));
        }
        if(parseInt(curHours % 10) != parseInt(nextHours % 10)){
            addBalls(MARGIN_LEFT + displayOffsets.hourUnit * (RADIUS + 1), MARGIN_TOP, parseInt(curHours%10));
            addBalls(MARGIN_LEFT + displayOffsets.colonAfterHour * (RADIUS + 1), MARGIN_TOP, 10);
        }
        if(parseInt(curMinutes / 10) != parseInt(nextMinutes / 10)){
            addBalls(MARGIN_LEFT + displayOffsets.minuteTen * (RADIUS + 1), MARGIN_TOP, parseInt(curMinutes / 10));
        }
        if(parseInt(curMinutes % 10) != parseInt(nextMinutes % 10)){
            addBalls(MARGIN_LEFT + displayOffsets.minuteUnit * (RADIUS + 1), MARGIN_TOP, parseInt(curMinutes % 10));
            addBalls(MARGIN_LEFT + displayOffsets.colonAfterMinute * (RADIUS + 1), MARGIN_TOP, 10);
        }
        if(parseInt(curSeconds / 10) != parseInt(nextSeconds / 10)){
            addBalls(MARGIN_LEFT + displayOffsets.secondTen * (RADIUS + 1), MARGIN_TOP, parseInt(curSeconds / 10));
        }
        if(parseInt(curSeconds % 10) != parseInt(nextSeconds % 10)){
            addBalls(MARGIN_LEFT + displayOffsets.secondUnit * (RADIUS + 1), MARGIN_TOP, parseInt(curSeconds % 10));
        }
        curShowTimeSeconds = nextShowTimeSeconds;
    }
    updateBalls();
}

/**
 * 添加小球到balls数组中
 * @param x 起始x坐标
 * @param y 起始y坐标
 * @param num 数字模型
 */
function addBalls(x, y, num) {
    for (var i = 0; i < digit[num].length; i++) {
        for (var j = 0; j < digit[num][i].length; j++) {
            if(digit[num][i][j] === 1) {
                var cellWidth = 2 * (RADIUS + 1);
                var centerX = x + (j * cellWidth) + (cellWidth / 2);
                var centerY = y + (i * cellWidth) + (cellWidth / 2);
                var aBall = {
                    x: centerX,                                                 //圆球圆心x坐标起始位置
                    y: centerY,                                                 //圆球圆心y坐标起始位置
                    r: RADIUS,                                                  //圆球半径
                    g: 1.5 + Math.random(),                                     //x加速度
                    rub: 0.3,                                                   //空气摩擦系数
                    vx: Math.pow(-1, Math.ceil(Math.random()*1000)) * 4,        //x轴方向初始速度
                    vy: -5,                                                     //y中方向初始速度
                    color: colors[Math.floor(Math.random() * colors.length)]    //圆球颜色
                };
                balls.push(aBall);
            }
        }
    }
}

/**
 * 更新balls数组里面的小球状态
 */
function updateBalls(){
    for(var i = 0; i < balls.length; i ++) {
        balls[i].x += balls[i].vx;
        balls[i].y += balls[i].vy;
        balls[i].vy += balls[i].g;

        /**
         * 画布底部 碰撞检测
         * 如果 圆球中心Y坐标 大于画布高度减去圆球半径, 则为碰撞
         * 重置圆球中心Y坐标到 画布高度减去圆球半径 位置
         * 并且设置y方向速度为负值, 并且扣除摩擦系数rub中的速度
         */
        if(balls[i].y >= WINDOW_HEIGHT - RADIUS) {
            balls[i].y = WINDOW_HEIGHT - RADIUS;
            balls[i].vy = - balls[i].vy * (1 - balls[i].rub);
        }
    }

    /**
     * 优化代码, 将位于画布宽度中的小球重置于balls数组头部
     * 当cnt则为位于画布宽度中小球的个数, balls索引大于cnt的数组元素均为在画布外围的小球,
     * 可以将其从balls里面删除, 使得小球的总数永远在一个可维护的范围之内.
     * @type {number}
     */
    var cnt = 0;
    for(var j = 0; j < balls.length; j ++) {
        if((balls[j].x + RADIUS) > 0 && (balls[j].x - RADIUS ) < WINDOW_WIDTH) {
            balls[cnt++] = balls[j];
        }
    }
    while (balls.length > cnt) {
        balls.pop();
    }
}

/**
 * 渲染
 * @param cxt
 */
function render(cxt) {
    cxt.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    var hours = parseInt(curShowTimeSeconds/3600),
        minutes = parseInt((curShowTimeSeconds - hours * 3600)/60),
        seconds = curShowTimeSeconds%60;

    renderDigit(MARGIN_LEFT + displayOffsets.hourTen * (RADIUS + 1) , MARGIN_TOP, parseInt(hours/10) , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.hourUnit * (RADIUS + 1), MARGIN_TOP, parseInt(hours%10) , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.colonAfterHour * (RADIUS + 1), MARGIN_TOP, 10 , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.minuteTen * (RADIUS + 1), MARGIN_TOP, parseInt(minutes/10) , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.minuteUnit * (RADIUS + 1), MARGIN_TOP, parseInt(minutes%10) , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.colonAfterMinute * (RADIUS + 1), MARGIN_TOP, 10 , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.secondTen * (RADIUS + 1), MARGIN_TOP, parseInt(seconds/10) , cxt);
    renderDigit(MARGIN_LEFT + displayOffsets.secondUnit * (RADIUS + 1), MARGIN_TOP, parseInt(seconds%10) , cxt);

    for (var i = 0; i < balls.length; i++) {
        renderBall(balls[i], cxt);
    }
}

/**
 * 渲染balls
 * @param ball
 * @param cxt
 */
function renderBall(ball, cxt){
    cxt.fillStyle = ball.color;
    cxt.beginPath();
    cxt.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    cxt.closePath();
    cxt.fill();
}

/**
 * 获取时间戳
 * @returns {*}
 */
function getCurrentShowTimeSeconds() {
    var curTime = new Date();
    var ret;
    if(!isClock) {
        ret = endTime.getTime() - curTime.getTime();
        ret = Math.round(ret/1000);
        return ret > 0 ? ret : 0;
    }
    //时钟显示效果
    ret = curTime.getHours() * 3600 + curTime.getMinutes() * 60 + curTime.getSeconds();
    return ret;
}

/**
 * 渲染时钟数字
 * @param x 起始x坐标
 * @param y 起始y坐标
 * @param num 要渲染的数字
 * @param cxt
 */
function renderDigit(x, y, num, cxt) {
    for(var i = 0; i < digit[num].length; i ++) {
        for(var j = 0; j < digit[num][i].length; j++) {
            if(digit[num][i][j] === 1) {
                cxt.fillStyle = "rgb(0, 102, 153)";
                var cellWidth = 2 * (RADIUS + 1);
                var centerX = x + (j * cellWidth) + (cellWidth / 2);
                var centerY = y + (i * cellWidth) + (cellWidth / 2);
                cxt.beginPath();
                cxt.arc(centerX, centerY, RADIUS, 0, 2*Math.PI);
                cxt.closePath();
                cxt.fill();
            }
        }
    }
}