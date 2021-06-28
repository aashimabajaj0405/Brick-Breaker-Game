// Select Canvas Element
let cvs = document.getElementById("breakout");
let ctx = cvs.getContext("2d");

// Add border to Canvas
cvs.style.border = "1px solid #f1f13b";

ctx.lineWidth = 3;

// Game Variables
let paddle_marginBottom = 50;
let paddleWidth = 100;
let paddleHeight = 20;
let ballRadius = 8;
let leftArrow = false;
let rightArrow = false;
let life = 3;
let score = 0;
let scoreUnit = 10;
let level = 1;
let maxLevel = 3;
let isGameOver = false;
let isLevelDone = true
let bricks = [];

// Create the Paddle
let paddle = {
    x : cvs.width/2 - paddleWidth/2,
    y : cvs.height - (paddleHeight + paddle_marginBottom),
    width : paddleWidth,
    height : paddleHeight,
    dx : 5
}

// Create the Ball
let ball = {
    x : cvs.width/2,
    y : paddle.y - ballRadius,
    radius : ballRadius,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// Create the Brick
let brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#ffcd05",
    strokeColor : "#fff",
}

// Draw Paddle
function drawPaddle(){
    ctx.fillStyle = "#4A171E";
    ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);

    ctx.strokeStyle = "#ffcd05";
    ctx.strokeRect(paddle.x,paddle.y,paddle.width,paddle.height);
}

// Draw Ball
function drawBall(){
    ctx.beginPath();

    ctx.arc(ball.x,ball.y,ballRadius,0,Math.PI*2);

    ctx.fillStyle = "#ffcd05";
    ctx.fill();

    ctx.strokeStyle = "#4A171E";
    ctx.stroke();

    ctx.closePath();
}

// Create Bricks
function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true
            }
        }
    }
    console.log(bricks)
}

createBricks();

// Draw Bricks
function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // Draw the brick only if it isn't broken
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// Move Paddle
function movePaddle(){
    if(rightArrow && paddle.x + paddleWidth < cvs.width){
        paddle.x += paddle.dx;
    }
    else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// Move Ball
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// Draw Function
function draw(){
    drawPaddle();
    drawBall();
    drawBricks();

    // Show Score
    showGameStats(score, 35, 30, scoreImg, 5, 10);
    // Show Life
    showGameStats(life, cvs.width - 25, 30, lifeImg, cvs.width - 55, 10);
    // Show Level
    showGameStats(level, cvs.width/2, 30, levelImg, cvs.width/2 - 30, 10);

}

// Update Game Function
function update(){
    movePaddle();
    moveBall();

    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();

    levelUp();
    gameOver();
}

// Ball and Paddle Collision
function ballPaddleCollision(){
    if((ball.x > paddle.x) && (ball.x < paddle.x + paddle.width) && (ball.y > paddle.y) && (ball.y < paddle.y + paddle.height)){
        // Play Sound
        paddleHit.play();

        // Check where the ball hit the paddle
        let collisionPoint = ball.x - (paddle.x + paddle.width/2);

        // Normalize the values
        collisionPoint = collisionPoint / (paddleWidth/2);

        // Calculate the angle
        let angle = collisionPoint * (Math.PI/3);

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }
}

// Ball and Wall Collision
function ballWallCollision(){
    if((ball.x + ball.radius > cvs.width) || (ball.x - ball.radius < 0)){
        ball.dx = -ball.dx;
        wallHit.play();
    }

    if(ball.y -  ball.radius < 0){
        ball.dy = -ball.dy;
        wallHit.play();
    }

    if(ball.y + ball.radius > cvs.height){
        life--;           // Lose Life
        lifeLost.play();  
        resetBall();
    }
}

// Ball and Brick Collision
function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            if(b.status){
                if((ball.x + ball.radius > b.x) && (ball.x + ball.radius < b.x + brick.width) && (ball.y + ball.radius > b.y) && (ball.y + ball.radius < b.y + brick.height)){
                    brickHit.play();
                    ball.dy = -ball.dy;
                    b.status = false;    // The brick is broken
                    score += scoreUnit;
                }
            }
        }
    }
}

// Show Game Stats
function showGameStats(text,textX,textY,img,imgX,imgY){
    // Draw Text
    ctx.fillStyle = "#fff";
    ctx.font = "25px Germania One";
    ctx.fillText(text,textX,textY);

    // Draw Image
    ctx.drawImage(img,imgX,imgY,width = 22,height = 22);
}

// Game Over
function gameOver(){
    if(life <= 0){
        showYouLose()
        isGameOver = true;
    }
}

// Level Up
function levelUp(){
    let isLevelDone = true;
    for(let r=0;r < brick.row;r++){
        for(let c=0;c < brick.column;c++){
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    if(isLevelDone){
        win.play();
        if(level >= maxLevel){
            showYouWin();
            isGameOver = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.7;
        resetBall();
        level++;
    }
}

// Reset Ball
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - ballRadius;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}


// Control the Paddle
document.addEventListener("keydown",function(event){
    if(event.keyCode == 37){
        leftArrow = true;
    }
    else if(event.keyCode == 39){
        rightArrow = true;
    }
})

document.addEventListener("keyup",function(event){
    if(event.keyCode == 37){
        leftArrow = false;
    }
    else if(event.keyCode == 39){
        rightArrow = false;
    }
})

let soundElement = document.getElementById("sound");
soundElement.addEventListener("click",audioHandler);

function audioHandler(){
    // change image sound_on/sound_off
    let imgSrc = soundElement.getAttribute("src");
    let soundImg = imgSrc == "img/soundon.png" ? "img/soundoff.png" : "img/soundon.png";
    soundElement.setAttribute("src",soundImg);

    // Mute and Unmute Sounds
    wallHit.muted = wallHit.muted ? false : true;
    paddleHit.muted = paddleHit.muted ? false : true;
    brickHit.muted = brickHit.muted ? false : true;
    win.muted = win.muted ? false : true;
    lifeLost.muted = lifeLost.muted ? false : true;
}

// Game Over Message
let gameOverElement = document.getElementById("gameOver");
let youWonElement = document.getElementById("youWon");
let youLoseElement = document.getElementById("youLose");
let restartElement = document.getElementById("restart");

// Click on Play Again
restartElement.addEventListener("click",function(){
    location.reload();  // Reload the Page
})

// Results
function showYouWin(){
    gameOverElement.style.display = "block";
    youWonElement.style.display = "block";
}

function showYouLose(){
    gameOverElement.style.display = "block";
    youLoseElement.style.display = "block";
}

// Game loop
function loop(){
    // Clear the Canvas
    ctx.drawImage(bgImg,0,0);
    draw();
    update();
    if(!isGameOver){
        requestAnimationFrame(loop);
    }
}
loop();
