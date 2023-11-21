// Import Monsters array from monsters.js
import monsters from './monsters.js';

// Wait for the DOM to finish loading before running the game
document.addEventListener("DOMContentLoaded", function() {
    gameLoop();
});

/**
 * Player statistics
 */
const player = {
    name: "Adventurer",
    hitPoints: 100,
    currentHitPoints: 100,
    armorClass: 13,
    toHit: 0,
    numDices: 1,
    hitDice: 10,
    plusDmg: 3,
};

/**
 * Sound Effects
 */
const soundEffects = {
    crit: 'assets/sounds/crit.ogg',
    miss: 'assets/sounds/miss.ogg',
    heal: 'assets/sounds/heal.ogg',
    rollDice: 'assets/sounds/roll-dice.ogg',
    rollHit: 'assets/sounds/roll-hit.ogg',
    rollMiss: 'assets/sounds/roll-miss.ogg',
    rollCrit: 'assets/sounds/roll-crit.ogg',
    monsterHit: 'assets/sounds/monster-hit.ogg',
    monsterSpawn: 'assets/sounds/monster-spawn.ogg',
    monsterDeath: 'assets/sounds/monster-death.ogg',
    playerHit: 'assets/sounds/player-hit.ogg',
    playerDeath: 'assets/sounds/player-death.ogg'
};

// Global variables
let isPlayerTurn = true;
let newGame = true;
let currentMonster = null;
let score = 0;
let highscore = 0;
let muted = false;

/**
 * Main game loop
 */
async function gameLoop() {
    // If this is a new game, display the new game screen
    if (newGame) {
        await newGameScreen();
    }
    while(player.currentHitPoints > 0) {
        if (currentMonster === null) {
            // If there's no current monster, select a random one
            currentMonster = copyMonster(selectRandomMonster());
            document.getElementById("monster-card-front").classList.add(`monster-${currentMonster.cardImage}`);
            document.getElementById('monster-name').textContent = currentMonster.name;
            document.getElementById("monster-card").classList.remove("hide-monster");
            playSound("monsterSpawn");
            updateUI();
          }
        if (isPlayerTurn) {
            // It's the player's turn
            await playerTurn();
        } else {
            // It's the monster's turn
            await monsterTurn();
        }
    }
    // Game over
    gameOver();
}

/**
 * Player turn function.
 * Listen for the player to do an action
 */
async function playerTurn() {
    return new Promise((resolve) => {
        // Prevent the attack button to be pressed several times
        function onPlayerActionClick() {
            playerActionBtn.removeEventListener('click', onPlayerActionClick);
            playerAbilityBtn.removeEventListener('click', onPlayerAbilityClick);
            dimButtons();
            playerAttack().then(() => {
                resolve();
            });
        }
        // Prevent the ability button to be pressed several times
        function onPlayerAbilityClick() {
            playerActionBtn.removeEventListener('click', onPlayerActionClick);
            playerAbilityBtn.removeEventListener('click', onPlayerAbilityClick);
            dimButtons();
            playerAbility().then(() => {
                resolve();
            });
        }
        // Listeners for attack and ability buttons
        dimButtons();
        let playerActionBtn = document.getElementById('attack-btn');
        playerActionBtn.addEventListener('click', onPlayerActionClick);
        let playerAbilityBtn = document.getElementById('ability-btn');
        playerAbilityBtn.addEventListener('click', onPlayerAbilityClick);
    });
}

/**
 * Player attack function
 * Rolls a d20 and compares the result to the targets Armor Class.
 * If hit, then roll damage dice and attacks.
 */
async function playerAttack() {
    // Flip the player card and dim the monster card
    document.getElementById("player-card").classList.add("player-card-flip");
    document.getElementById("monster-card").classList.add("dim");
    // Reset the flags for hit, crit and damage
    let hit = false;
    let crit = false;
    let damage = 0;
    // Roll for attack
    let diceRoll = rollDice(20);
    // Check if it's a Critical Roll
    if (diceRoll === 20) {
        crit = true;
    }
    // Check if it's enough to hit, Critical Hits always hits
    if ((diceRoll >= currentMonster.armorClass) || (crit)) {
        // Calculate Damage
        hit = true;
        damage = rollForDamage(player, crit);
        score += damage;
        currentMonster.hitPoints -= damage;
    } else {
    }
    // Display the results
    displayResult(diceRoll, hit, crit, damage);
    await sleep(3000);
    // Close the result card and brighten the monster card
    document.getElementById("player-card").classList.remove("player-card-flip");
    document.getElementById("monster-card").classList.remove("dim");
    // If the attack hits, play the attack animation
    if (hit) {
        await hitAnimation(isPlayerTurn, damage, crit);
    }
    await sleep(700);
    // Reset for the next turn
    document.getElementById('back-hit').classList.remove('back-hit-critical');
    isPlayerTurn = false;
    resetResults();
}

/**
 * Player ability function.
 * This will roll a d20 and heal the player for that amount.
 */
async function playerAbility() {
    // Flip the player card and dim the monster card
    document.getElementById("player-card").classList.add("player-card-flip");
    document.getElementById("monster-card").classList.add("dim");
    await sleep(700);
    document.getElementById('back-text-upper').textContent = `You drink a potion!`;
    await sleep(1000);
    // Roll a d20
    let healing = rollDice(20);
    diceAnimation(healing);
    player.currentHitPoints += healing;
    // Prevent players hitpoints to be more than its max value
    if (player.currentHitPoints > player.hitPoints) {
        player.currentHitPoints = player.hitPoints;
    }
    // Display animations for healing
    document.getElementById('back-roll').textContent = `${healing}`;
    await sleep(2000);
    document.getElementById("player-card").classList.remove("player-card-flip");
    document.getElementById("monster-card").classList.remove("dim");
    await sleep(700);
    document.getElementById(`player-damage-taken`).textContent = `+${healing}`;
    document.getElementById(`player-damage-taken`).classList.add("damage-taken");
    playSound("heal");
    await sleep(500);
    document.getElementById('player-hp').textContent = player.currentHitPoints;
    document.getElementById(`player-damage-taken`).textContent = ``;
    document.getElementById(`player-damage-taken`).classList.remove("damage-taken");
    // Reset for the next turn
    isPlayerTurn = false;
    resetResults();
}

/**
 * Monster attack function
 * Rolls a d20 and compares the result to the targets Armor Class.
 * If hit, then roll damage die and attack.
 */
async function monsterTurn() {
    // Check if the monster is still alive.
    if (currentMonster.hitPoints <= 0) {
        playSound("monsterDeath");
        document.getElementById("monster-card").classList.add("hide-monster");
        await sleep(2000);
        document.getElementById("monster-card-front").classList.remove(`monster-${currentMonster.cardImage}`);
        currentMonster = null;
        isPlayerTurn = true;
    } else {
        // It is now the monsters turn, it will attack you!
        // Bring the monster card above the player
        document.getElementById('top-area').classList.add('on-top');
        // Reset the flags for crit and damage
        let crit = false;
        let damage = 0;
        // Roll for attack
        let diceRoll = rollDice(20);
        // Check if it's a Critical Roll
        if (diceRoll === 20) {
            crit = true;
        }
        // Add the monsters toHit to the attack roll
        let attackRoll = diceRoll + currentMonster.toHit;
        // Check if it's enough to hit, Critical Hits always hits
        if ((attackRoll >= player.armorClass) || (crit)) {
            damage = rollForDamage(currentMonster, crit);
            player.currentHitPoints -= damage;
        }
        // Play the attack animation
        await hitAnimation(isPlayerTurn, damage, crit);
        await sleep(700);
        // Bring the monster card back
        document.getElementById('top-area').classList.remove('on-top');
    }
    document.getElementById('player-hp').textContent = player.currentHitPoints;
    // End the turn
    isPlayerTurn = true;
}

/** 
 * @param {Object} monster 
 * @returns the stats from a monster in the monster array
 */
function copyMonster(monster) {
    return Object.assign({}, monster);
}

/**
 * @returns a randomly selected monster from the monster array
 */
function selectRandomMonster() {
    return monsters[Math.floor(Math.random() * monsters.length)];
}

/**
 * Reads the hit dice(s) of the creature and adds them together
 * @param {Object} creature 
 * @param {Boolean} crit
 * @returns a INT of the total damage dealt.
 */
function rollForDamage(creature, crit) {
    let damage = 0;
    let dices = 0;
    // If it's a Critical hit, then double the amount of damage dices
    if (crit) {
        dices = creature.numDices * 2;
    } else {
        dices = creature.numDices;
    }
    // Roll for damage
    for (let i=0; i < dices; i++) {
        let dmgRoll = rollDice(creature.hitDice);
        damage += dmgRoll;
    }
    // Add the plus damage modifier
    damage += creature.plusDmg;
    return damage;
}

/**
 * Simulates a roll of a dice
 * @param {Integrer} dice 
 * @returns random number between 1 and the input number
 */
function rollDice(dice) {
    let roll = Math.floor(Math.random() * dice) + 1;
    return roll;
}

/**
 * Updates the UI for both the player and the current monster
 */
function updateUI() {
    // Update players HP
    if (player.currentHitPoints <= 0){
        // Prevent the HP to be lower than 0
        player.currentHitPoints = 0;
    }
    document.getElementById('player-hp').textContent = player.currentHitPoints;
    document.getElementById('player-ac').textContent = player.armorClass;
    // Update monsters HP
    if (currentMonster == null) {
        // If no monster is present then show nothing
        document.getElementById('monster-hp').textContent = '';
        document.getElementById('monster-ac').textContent = '';
    } else {
        // Prevent the HP to be lower than 0
        if (currentMonster.hitPoints <= 0) {
            currentMonster.hitPoints = 0;
        }
        document.getElementById('monster-hp').textContent = currentMonster.hitPoints;
        document.getElementById('monster-ac').textContent = currentMonster.armorClass;
    }
}

/**
 * Sleep function
 * @param {time} ms 
 * CREDIT: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Function that dims the attack and ability buttons.
 * It also moves the buttons to the side of the player card
 * if on smaller screens (controlled with css)
 */
function dimButtons() {
    document.getElementById("attack-btn").classList.toggle("dim");
    document.getElementById("attack-btn").classList.toggle("move-btn-left");
    document.getElementById("ability-btn").classList.toggle("dim");
    document.getElementById("ability-btn").classList.toggle("move-btn-right");
}

/**
 * Toggle switch for mute button
 * CREDIT: https://stackoverflow.com/questions/56040478/change-fa-icon-on-click
 */
const muter = document.querySelector("#sound-toggle");
muter.addEventListener("click", (e) => {
  ["fa-volume-high", "fa-volume-xmark"].forEach(
    c => e.target.classList.toggle(c));
    muted = !muted;
});

/**
 * Plays sound from soundeffects array
 * @param {String} effect 
 * CREDIT: https://gomakethings.com/how-to-play-a-sound-with-javascript/
 */
function playSound(effect) {
    let sound = new Audio(soundEffects[effect]);
    // only play the sound if not muted
    if (!muted) { 
        sound.play();
    } 	
}

/**
 * Function to play the attack animation
 * @param {Boolean} isPlayerTurn 
 * @param {Integrer} damage 
 * @param {Boolean} crit 
 */
async function hitAnimation(isPlayerTurn, damage, crit)  {
	let attacker = null;
    let target = null;
    // Set attack and target variables depending on who's turn it is
    if (isPlayerTurn) {
        attacker = "player";
        target = "monster";
    } else {
        attacker = "monster";
        target = "player";
    }
    await sleep(1000);
    document.getElementById(`${attacker}-card`).classList.add(`${attacker}-attack-animation`);
    await sleep(150);
    if (damage === 0) {
        // Miss Animation
        damage = "MISS!";
        document.getElementById(`${target}-damage-taken`).textContent = `${damage}`;
        document.getElementById(`${target}-damage-taken`).classList.add("damage-taken");
        playSound("miss");
        await sleep(80);
        await sleep(100);
        document.getElementById(`${attacker}-card`).classList.remove(`${attacker}-attack-animation`);
        await sleep(800);
        document.getElementById(`${target}-damage-taken`).textContent = ``;
        document.getElementById(`${target}-damage-taken`).classList.remove("damage-taken");
    } else {
        // Check if its a Critical Hit
        if (crit) {
            document.getElementById(`${target}-damage-taken`).classList.add('damage-taken-critical');
        }
        // Hit Animation
        document.getElementById(`${target}-card`).classList.add("damage-animation");
        if (crit) {
            playSound("crit");
        } else {
            playSound(`${attacker}Hit`);
        }
        document.getElementById(`${target}-damage-taken`).textContent = `-${damage}`;
        document.getElementById(`${target}-damage-taken`).classList.add("damage-taken");
        await sleep(80);
        document.getElementById(`${target}-card`).classList.remove("damage-animation");
        updateUI();
        await sleep(100);
        document.getElementById(`${attacker}-card`).classList.remove(`${attacker}-attack-animation`);
        await sleep(800);
        document.getElementById(`${target}-damage-taken`).textContent = ``;
        document.getElementById(`${target}-damage-taken`).classList.remove("damage-taken");
        document.getElementById(`${target}-damage-taken`).classList.remove('damage-taken-critical');
    }
}

/**
 * Function to animate the rolling of the dice
 * @param {Integrer} dice 
 */
async function diceAnimation(dice) {
    playSound("rollDice");
    for (let i = 0; i < 10; i++) {
        // Show a random number for the dice animation
        document.getElementById('back-roll').textContent = rollDice(20);
        await sleep(100);
    }
    // Show the actual roll
    document.getElementById('back-roll').textContent = `${dice}`;
  }

/**
 * Function to present the result to the user on the result card
 * @param {Integrer} dice 
 * @param {Integrer} hit 
 * @param {Boolean} crit 
 */
async function displayResult(dice, hit, crit) {
    document.getElementById('back-title').textContent = `YOUR TURN`;
    await sleep(700);
    diceAnimation(dice);
    await sleep(1800);
    if (hit) {
        if (crit) {
            document.getElementById('back-hit').classList.add('back-hit-critical');
            document.getElementById('back-hit').textContent = `CRITICAL HIT!`;
            playSound("rollCrit");
        } else {
            document.getElementById('back-hit').textContent = `HIT!`;
            playSound("rollHit");
        }
    } else {
        document.getElementById('back-hit').textContent = `MISS!`;
        playSound("miss");
    }
    await sleep(1000);
}

/**
 * Clears the text on the result card
 */
function resetResults() {
    document.getElementById('back-title').textContent = ``;
    document.getElementById('back-subtitle').textContent = ``;
    document.getElementById('back-text-upper').textContent = ``;
    document.getElementById('back-text-lower').textContent = ``;
    document.getElementById('back-roll').textContent = ``;
    document.getElementById('back-hit').textContent = ``;
}

/**
 * Displays the new game screen.
 * Waits for the player to press the start game buttoin
 */
async function newGameScreen() {
    // Flip the player card
    document.getElementById("player-card").classList.add("player-card-flip");
    document.getElementById("player-card").classList.add("big-card");
    await sleep(800);
    // Show the start button
    document.getElementById("start-btn").classList.add("button-fade");
    document.getElementById("start-btn").classList.remove("hidden");
    return new Promise((resolve) => {
        // Prevent the start button to be clicked twice
        async function onStartGameClick() {
            startGameBtn.removeEventListener('click', onStartGameClick);
            newGame = false;
            // Flip the player card, hide the start button
            document.getElementById("player-card").classList.remove("player-card-flip");
            document.getElementById("player-card").classList.remove("big-card");
            document.getElementById("start-btn").classList.remove("button-fade");
            document.getElementById("start-btn").classList.add("hidden");
            updateUI();
            await sleep(850);
            resetResults();
            // Show the ability buttons and the monster card
            document.getElementById("attack-btn").classList.remove("hidden");
            document.getElementById("ability-btn").classList.remove("hidden");
            document.getElementById("monster-card").classList.remove("hidden");
            resolve();
        }
        let startGameBtn = document.getElementById('start-btn');
        startGameBtn.addEventListener('click', onStartGameClick);
    });
}

/**
 * Displays the game over screen with the players final score.
 */
async function gameOver() {
    playSound("playerDeath");
    // remove the monster card
    document.getElementById("monster-card").classList.add("hide-monster");
    document.getElementById("attack-btn").classList.add("hidden");
    document.getElementById("ability-btn").classList.add("hidden");
    // flip the player card
    document.getElementById("player-card").classList.add("player-card-flip");
    document.getElementById("player-card").classList.add("big-card");
    await sleep(850);
    document.getElementById("start-btn").classList.add("button-fade");
    // display the game over text and final score
    document.getElementById('back-title').textContent = `GAME OVER`;
    document.getElementById('back-subtitle').textContent = `Our hero has perished`;
    document.getElementById('back-roll').textContent = `${score}`;
    // Check if it's a new high-score
    if (score > highscore) {
        document.getElementById('back-hit').textContent = `NEW HIGHSCORE!`;
        highscore = score;
    }
    document.getElementById('back-text-upper').textContent = `Highscore: ${highscore}`;
    // Display the restart button
    document.getElementById('start-btn').textContent = `RESTART`;
    document.getElementById("start-btn").classList.remove("hidden");
    // Prevent the reset button to be pressed twice
    function onResetGameClick() {
        resetGameBtn.removeEventListener('click', onResetGameClick);
        resetGame();
    }
    let resetGameBtn = document.getElementById('start-btn');
    resetGameBtn.addEventListener('click', onResetGameClick);
}

/**
 * Resets the necessary flags and restarts the game
 */
async function resetGame() {
    // Reset the player HP and the flags
    player.currentHitPoints = player.hitPoints;
    currentMonster = null;
    score = 0;
    // Flip the player card down again and clear the card
    document.getElementById("player-card").classList.remove("player-card-flip");
    document.getElementById("player-card").classList.remove("big-card");
    document.getElementById("start-btn").classList.add("hidden");
    await sleep(850);
    document.getElementById("attack-btn").classList.remove("hidden");
    document.getElementById("ability-btn").classList.remove("hidden");
    resetResults();
    // restart gameLoop();
    gameLoop();
}