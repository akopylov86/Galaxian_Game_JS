const divs = document.querySelectorAll('.game div');
const gameWidth = Math.round(Math.sqrt(divs.length))
const lastLine = divs.length - gameWidth;
let playerIndex = divs.length - Math.round(gameWidth/2)
const playersLeftBorder = divs.length - gameWidth-1,
    playersRightBorder = divs.length-1
let gameStarted = false;
let enemyIdx = [];
const speedElement = document.querySelector(".speed");
let speed = 3;

const getInitial = () => {
    enemyIdx = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
        43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
    ];
    divs.forEach(div => {div.classList.remove("enemy", "player")})
    for (let enemy of enemyIdx) {
        divs[enemy].classList.add("enemy")
    }
    divs[playerIndex].classList.add("player")
    moveEnemies("left");
    speed = speedElement.value;
}

const gotRight = () => {
    let gotRighto = false
    enemyIdx.forEach(enemy => {
        if (enemy % gameWidth === gameWidth - 1)
            gotRighto = true;
    })

     return gotRighto
}

const moveEnemies = (direction) => {

    moveBlock(direction);
    if(enemyIdx[enemyIdx.length-1] >= lastLine){
        stopTheGame()
    }
    if(enemyIdx[0] % gameWidth === 0) {
        direction = direction === "down" ? "right" : "down"
    }
    if(gotRight()) {
        direction = direction === "down" ?  "left" : "down"
    }

    if(gameStarted)
        setTimeout(moveEnemies.bind(this, direction), 1000-(speed*120))
}

const moveBlock = (direction) => {
    for (let enemy of enemyIdx) {
        divs[enemy].classList.remove("enemy")
    }

    if(direction === "left"){
        enemyIdx.forEach((enemy, index) => enemyIdx[index] -= 1)
    }
    if(direction === "right"){
        enemyIdx.forEach((enemy, index) => enemyIdx[index] += 1)
    }
    if(direction === "down"){
        enemyIdx.forEach((enemy, index) => enemyIdx[index] += gameWidth)
    }

    for (let enemy of enemyIdx) {
        divs[enemy].classList.add("enemy")
    }
}

const movePlayer = event => {
    if(gameStarted && event.code === "ArrowLeft"){
        if(playerIndex > playersLeftBorder){
            console.log(playerIndex)
            divs[playerIndex].classList.remove("player")
            playerIndex -= 1;
            divs[playerIndex].classList.add("player")
            console.log(playerIndex)
        }
    }
    if(gameStarted && event.code === "ArrowRight"){
        if(playerIndex < playersRightBorder){
            divs[playerIndex].classList.remove("player")
            playerIndex++
            divs[playerIndex].classList.add("player")
        }
    }
    if(gameStarted && event.code === "Space"){
        doShoot()
    }
    if(gameStarted && event.code === "Escape"){
        stopTheGame()
    }
    if(!gameStarted && event.code === "Enter"){
        gameStarted = true;
        getInitial()
    }
}

const doShoot = () => {

    let bulletIndex = playerIndex;

    const flyBullet = () => {


        if(enemyIdx.includes(bulletIndex)){
            enemyIdx = enemyIdx.filter(item => item !== bulletIndex )
            divs[bulletIndex].classList.remove("enemy", "bullet")
            if(!enemyIdx.length) {
                stopTheGame()
            }
        return
        }
        divs[bulletIndex].classList.remove("bullet");
        bulletIndex -= gameWidth;
        if (bulletIndex > 0) {

            divs[bulletIndex].classList.add("bullet");
            setTimeout(flyBullet, 50)
        }

    }

    flyBullet()
}

const stopTheGame = () =>{
    if(enemyIdx.length){
        console.log("game over")
    }else {
        console.log("You win!")
    }
    gameStarted = false;
}

document.addEventListener('keydown', movePlayer)
