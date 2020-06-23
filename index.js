const messageField = document.querySelector('.message');
let winLose = 0;
const message = "Press Enter to start new game";
messageField.innerHTML = message;
let extraMessage = "";
const divs = document.querySelectorAll('.game div');
const gameWidth = Math.round(Math.sqrt(divs.length))
const lastLine = divs.length - gameWidth;

const player = {
    isPlayer: true,
    index : divs.length - Math.round(gameWidth/2),
}
const playersLeftBorder = divs.length - gameWidth,
    playersRightBorder = divs.length-1
let gameStarted = false;

let defenderIndex = 0;

const enemies = {
    enemyIdx : [],
    deleteItem(id){
        this.enemyIdx = this.enemyIdx.filter(item => item !== id )
    },
    shiftEnemies(number){
        this.enemyIdx.forEach((enemy, index) => this.enemyIdx[index] += number)
    },
};
const speedElement = document.querySelector(".speed");
let speed = 3;


const showMessage = (visible = true) => {
    extraMessage = winLose>0 ? "You win!!! " : (winLose <0 ? "You lose :(( ": "" )
    messageField.innerHTML = visible ? extraMessage + message : "";
}

const startGame = () => {
    showMessage(false);

    resetGameField()

    moveEnemies(-1);
    speed = speedElement.value;
}

const resetGameField = () =>{

    divs.forEach(div => {div.classList.remove("enemy", "player", "defender", "bullet")})

    //player
    player.index = divs.length - Math.round(gameWidth/2)

    //enemies
    enemies.enemyIdx = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
        43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
    ];
    for (let enemy of enemies.enemyIdx) {
        divs[enemy].classList.add("enemy")
    }

    //defender
    defenderIndex = Math.round(Math.random() * gameWidth);
    divs[player.index].classList.add("player")
}

const stuckRight = () => {
    let gotRighto = false
    enemies.enemyIdx.forEach(enemy => {
        if (enemy % gameWidth === gameWidth - 1)
            gotRighto = true;
    })

     return gotRighto
}

const stuckLeft = () => {
    return enemies.enemyIdx[0] % gameWidth === 0;
}

const moveEnemies = (direction) => {
    moveDefender();
    moveBlock(direction);
    if(enemies.enemyIdx[enemies.enemyIdx.length-1] >= lastLine){
        stopTheGame()
    }
    if(stuckLeft()) {
        direction = direction === gameWidth ? 1 : gameWidth
    }
    if(stuckRight()) {
        direction = direction === gameWidth ?  -1 : gameWidth
    }

    if(gameStarted)
        setTimeout(moveEnemies.bind(this, direction), 1000-(speed*120))
}

const moveDefender = () => {
    //-1 is left, 1 is right, 0 dont move - just shoot!!!
    const direction = defenderIndex > player.index % gameWidth
                    ? -1
                    : (defenderIndex < player.index % gameWidth ? 1 : 0);
    doShoot(defenderIndex, -1, player)
    divs[defenderIndex].classList.remove("defender");
    defenderIndex += direction;
    divs[defenderIndex].classList.add("defender")
}

const moveBlock = (direction) => {
    for (let enemy of enemies.enemyIdx) {
        divs[enemy].classList.remove("enemy")
    }

    enemies.shiftEnemies(direction)

    for (let enemy of enemies.enemyIdx) {
        divs[enemy].classList.add("enemy")
    }
}

const handleKey = event => {
    if(gameStarted && event.code === "ArrowLeft"){
        movePlayerLeft()
    }
    if(gameStarted && event.code === "ArrowRight"){
        movePlayerRight()
    }
    if(gameStarted && event.code === "Space"){
        doShoot(player.index)
    }
    if(gameStarted && event.code === "Escape"){
        stopTheGame(0)
    }
    if(!gameStarted && event.code === "Enter"){
        gameStarted = true;
        startGame()
    }
}

const movePlayerLeft = () => {
    if(player.index > playersLeftBorder){
        divs[player.index].classList.remove("player")
        player.index -= 1;
        divs[player.index].classList.add("player")
    }
}

const movePlayerRight = () => {
    if(player.index < playersRightBorder){
        divs[player.index].classList.remove("player")
        player.index++
        divs[player.index].classList.add("player")
    }
}

const doShoot = (shooter, direction= 1, target = {enemies, targetClassName:["enemy"]}) => {

    let bulletIndex = shooter;

    const flyBullet = (direction, target) => {
        if(!target || !gameStarted) return;
        if (target.isPlayer){
            if(target.index === bulletIndex){
                stopTheGame(-1)
            }
        }else if (Array.isArray(target.enemies.enemyIdx)) {

            if(target.enemies.enemyIdx.includes(bulletIndex)){
                target.enemies.deleteItem(bulletIndex)
                divs[bulletIndex].classList.remove(...target.targetClassName, "bullet")
                if(!target.enemies.enemyIdx.length) {
                    stopTheGame(1)
                }
                return
            }
        }
        divs[bulletIndex].classList.remove("bullet");
        bulletIndex -= gameWidth * direction;
        if (bulletIndex > 0 && bulletIndex <= divs.length) {

            divs[bulletIndex].classList.add("bullet");
            setTimeout(() => flyBullet(direction, target), 50)
        }

    }

    flyBullet(direction, target)
}

const stopTheGame = (result) =>{
    winLose = result;
    gameStarted = false;
    showMessage(true)
}

document.addEventListener('keydown', handleKey)
