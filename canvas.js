const speedElement = document.querySelector(".speed");
const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d");
ctx.font = '48px serif';
ctx.strokeStyle = "white";
ctx.strokeText("Press Enter to start new game", 5, 300);
const fieldW = 600;
const ballRadius = 15;
const PI = Math.PI;
const imgEnemy = new Image()
    imgEnemy.src = "./img/enemy.jpg";
const imgPlayer = new Image()
    imgPlayer.src = "./img/player.png"
const imgDefender = new Image()
    imgDefender.src = "./img/defender.png"

let gameID = null;
let gameStarted = false;
let canShoot = true;
const shootingTimeout = 300;

const enemyLines = 3;
const enemyAmountInLine = 8;

let enemyPack = null;
let player = null;
let defender = null;

class Enemy {
    constructor(indexX, indexY, extraX=0, extraY=0) {
        this.radius = ballRadius;
        this.x = (indexX * this.radius * 4) + (extraX * this.radius)//(index * this.radius * 2) + this.radius;
        this.y = (indexY * this.radius * 2) + (extraY * this.radius);
        this.vx = 1;
        this.vy = 0;
        this.color = "red";
        this.stuckLeft = false;
        this.stuckRight = false;
    }
    draw = () => {

        // ctx.beginPath()
        // ctx.arc(this.x, this.y, this.radius, 0, PI*2,true)
        // ctx.closePath();
        // ctx.fillStyle = this.color;
        // ctx.fill()
        ctx.drawImage(imgEnemy, this.x-this.radius, this.y-this.radius,this.radius*2, this.radius*2)
    }

    move = () => {
        ctx.clearRect(this.x - this.radius,this.y - this.radius, this.radius*2, this.radius*2)

        if(this.vy){
            this.y += (this.vy * this.radius);
            this.vy = 0;
            this.stuckLeft = false;
            this.stuckRight = false;
        }else {
            this.x += this.vx * (this.radius);

            if(this.x <= this.radius ){
                this.stuckLeft = true;
            }
            if(this.x >= fieldW - this.radius ){
                this.stuckRight = true;
            }
        }
        this.draw()

        if(this.y >= fieldW-ballRadius){
            stopTheGame(-1);
        }
    }

    changeDirection(){
        this.vx *= -1;
        this.vy = 1;
    }

    bulletHitMe(x,y){
        return ((x >= this.x - this.radius && x <= this.x + this.radius) && (y >= this.y - this.radius && y <= this.y + this.radius) )
    }

    kill(){
        ctx.clearRect(this.x - this.radius,this.y - this.radius, this.radius*2, this.radius*2)
    }

}

class Defender {
    constructor() {
        this.radius = ballRadius;
        this.x = fieldW - this.radius;
        this.y = this.radius;
        this.color = "brown";
        this.bulletColor = "orange";
        this.opponent = player;
        this.direction = -1;
        this.shootDelay = 4; //shoot every N moves
        this.movesBeforeShot = this.shootDelay;
        this.hasShootTimeout = false;
        this.shootSpeed = speedElement.value-2;
    }
    move(){
        if(this.direction) {
            const new_position = this.x + this.radius * this.direction
            ctx.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
            this.x = new_position;

            this.draw();
        }
        if(this.x > this.opponent.x)
            this.direction = -1;
        else if(this.x < this.opponent.x)
            this.direction = 1;
        else
            this.direction = 0;

        if(this.movesBeforeShot){
            this.movesBeforeShot--
        }else{
            this.doShoot();
            this.movesBeforeShot = this.shootDelay
        }
    }

    draw(){
        // ctx.beginPath()
        // ctx.arc(this.x, this.y, this.radius, 0, PI*2,true)
        // ctx.closePath();
        // ctx.fillStyle = this.color;
        // ctx.fill()
        ctx.drawImage(imgDefender, this.x-this.radius, this.y-this.radius,this.radius*2, this.radius*2)
    }

    doShoot(){
        const bullet = new Bullet(this, 1)
        bullet.shoot();
    }
}

class Player {
    constructor() {
        this.radius = ballRadius;
        this.x = this.radius;
        this.y = fieldW - this.radius;
        this.color = "white";
        this.bulletColor = "green";
        this.opponent = enemyPack;
        this.hasShootTimeout = true;
        this.shootSpeed = 20;
    }

    move(direction){
        const new_position =  this.x + this.radius * direction
        if(new_position < this.radius/2 || new_position >= fieldW-this.radius/2)
            return

        ctx.clearRect(this.x - this.radius,this.y - this.radius, this.radius*2, this.radius*2)
        this.x = new_position;

        this.draw()
    }

    draw(){
        // ctx.beginPath()
        // ctx.arc(this.x, this.y, this.radius, 0, PI*2,true)
        // ctx.closePath();
        // ctx.fillStyle = this.color;
        // ctx.fill()
        ctx.drawImage(imgPlayer, this.x-this.radius, this.y-this.radius,this.radius*2, this.radius*2)
    }

    bulletHitMe(x,y){
        return ((x >= this.x - this.radius && x <= this.x + this.radius) && (y >= this.y - this.radius && y <= this.y + this.radius) )
    }

    checkHitted(x, y){
        const imKilled = this.bulletHitMe(x, y);
        if(imKilled){
            stopTheGame(-1);
        }
        return (imKilled)
    }
}

class Bullet {
    constructor(shooter, direction) {
        this.shooter = shooter;
        this.direction = direction;
        this.x = shooter.x;
        this.y = shooter.y + (shooter.radius * direction);
        this.radius = 5;
        this.color = shooter.bulletColor;
        this.shootIntervalId = null;
        this.shootSpeed = 30 - shooter.shootSpeed;
    }

    move(){
        if(!gameStarted){
            this.stopTheBullet()
            return;
        }
        ctx.clearRect(this.x - this.radius,this.y - this.radius, this.radius*2, this.radius*2)
        if(this.y<0 || this.y>fieldW){
            this.stopTheBullet();
            return
        }
        this.y += this.direction * this.radius;
        this.draw()
        if(this.shooter.opponent.checkHitted(this.x, this.y)){
            this.stopTheBullet()
        }

    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, PI*2,true)
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill()
    }


    shoot(){
        if (this.shooter.hasShootTimeout && canShoot || !this.shooter.hasShootTimeout) {
            console.log(this.shooter, "shoots with speed", this.shootSpeed)
            this.shootIntervalId = setInterval(
                ()=>{
                    this.draw();
                    this.move()
                }
            , this.shootSpeed)
            if(this.shooter.hasShootTimeout) {
                canShoot = false;
                setTimeout(() => {
                    canShoot = true
                }, shootingTimeout)
            }
        }

    }

    stopTheBullet(){
        clearInterval(this.shootIntervalId);
        ctx.clearRect(this.x - this.radius,this.y - this.radius, this.radius*2, this.radius*2)
    }
}

class EnemyPack {
    constructor() {
        this.enemies = this.initEnemies();
        this.leftest = this.findLeftest();
        this.rightest = this.findRightest();
    }

    initEnemies(){
        const enemies = [];
        for (let i = 1; i <= enemyLines; i++) {
            for (let j=1; j <= enemyAmountInLine; j++ ){
                enemies.push(new Enemy( j, i, i%2===0 ? 2 : 0))
            }
        }
        return enemies
    }

    movePack(){
        if(this.leftest.stuckLeft || this.rightest.stuckRight){
            this.changeDirectionPack()
        }
        this.enemies.forEach((enemy)=>enemy.move())
        this.findSidesOfPack();
    }

    changeDirectionPack(){
        this.enemies.forEach(enemy=>enemy.changeDirection())
    }

    findSidesOfPack(){
        if(this.enemies) {
            this.leftest = this.findLeftest();
            this.rightest = this.findRightest();
        }
    }

    findRightest(){

        return this.enemies.reduce((right, element)=> right = element.x > right.x ? element : right
                                    ,this.enemies[this.enemies.length-1])
    }

    findLeftest(){
        return this.enemies.reduce((left, element)=> left = element.x < left.x ? element : left
                                    ,this.enemies[0])
    }

    checkHitted(x, y){
        const enemyKilled = this.enemies.find(enemy=>enemy.bulletHitMe(x, y));
        if(enemyKilled){
            this.enemies = this.enemies.filter(enemy=>enemy!==enemyKilled)
            enemyKilled.kill()
        }
        if(!this.amount()){
            stopTheGame(1);
        }
        return (enemyKilled)
    }
    amount() {
        return this.enemies.length;
    }
}


initGame = () => {
    const enemySpeed = 500 - (speedElement.value*75);
    clearField()
    enemyPack = new EnemyPack();
    player = new Player();
    defender = new Defender();
    gameStarted = true;
    player.draw();
    gameID = setInterval(()=>{
            enemyPack.movePack()
            defender.move()
    },enemySpeed)
}

stopTheGame = (result) => {
    clearInterval(gameID)
    gameStarted = false;
    ctx.font = '48px serif';
    ctx.strokeStyle = "white";
    const text = result > 0 ? "You win!!!" : "You lose :((("
    ctx.strokeText(text, 150, 300);
    ctx.strokeText("Press Enter to start new game", 5, 350)
}

clearField = () => {
    ctx.clearRect(0, 0, fieldW, fieldW)
}

const handleKey = (event) => {
    if(gameStarted && event.code === "ArrowLeft"){
        player.move(-1)
    }
    if(gameStarted && event.code === "ArrowRight"){
        player.move(1)
    }
    if(gameStarted && event.code === "Space"){
        const bullet = new Bullet(player, -1)
        bullet.shoot();
    }
    if(!gameStarted && event.code === "Enter"){
        initGame()
    }
    if(gameStarted && event.code === "Escape"){
        stopTheGame(-1)
    }
}

addEventListener('keydown', handleKey)

