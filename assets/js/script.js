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
 * Monster statistics
 */
const monsters = [
    {
        name: "goblin",
        cardImage: "goblin1",
        hitPoints: 7,
        armorClass: 10,
        toHit: 4,
        numDices: 1,
        hitDice: 6,
        plusDmg: 2,
    },
    {
        name: "goblin scout",
        cardImage: "goblin2",
        hitPoints: 8,
        armorClass: 11,
        toHit: 3,
        numDices: 2,
        hitDice: 4,
        plusDmg: 2,
    },
    {
        name: "goblin champion",
        cardImage: "goblin3",
        hitPoints: 12,
        armorClass: 12,
        toHit: 4,
        numDices: 2,
        hitDice: 6,
        plusDmg: 2,
    },
    {
        name: "skeleton",
        cardImage: "skeleton1",
        hitPoints: 13,
        armorClass: 11,
        toHit: 4,
        numDices: 2,
        hitDice: 6,
        plusDmg: 4,
    },
    {
        name: "skeleton guard",
        cardImage: "skeleton2",
        hitPoints: 13,
        armorClass: 12,
        toHit: 4,
        numDices: 1,
        hitDice: 6,
        plusDmg: 4,
    },
    {
        name: "skeleton mage",
        cardImage: "skeleton3",
        hitPoints: 10,
        armorClass: 9,
        toHit: 2,
        numDices: 4,
        hitDice: 4,
        plusDmg: 3,
    },
    {
        name: "orc",
        cardImage: "orc",
        hitPoints: 18,
        armorClass: 14,
        toHit: 5,
        numDices: 1,
        hitDice: 12,
        plusDmg: 3,
    },
    {
        name: "troll",
        cardImage: "troll",
        hitPoints: 32,
        armorClass: 12,
        toHit: 7,
        numDices: 2,
        hitDice: 6,
        plusDmg: 4,
    },
];

// Global variables
let isPlayerTurn = true;
let newGame = true;
let currentMonster = null;
let score = 0;

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
        // Prevent the buttons to be pressed several times
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
        // Listener for attack and ability buttons
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
    // Add the players toHit to the attack roll
    let attackRoll = diceRoll + player.toHit;
    // Check if it's enough to hit, Critical Hits always hits
    if ((attackRoll >= currentMonster.armorClass) || (crit)) {
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
    // Close the result card and brighten the background
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
    // Roll 4d4 + 4
    let healing = rollDice(20);
    diceAnimation(healing);
    player.currentHitPoints += healing;
    // Prevent players hitpoints to be more than its max value
    if (player.currentHitPoints > player.hitPoints) {
        player.currentHitPoints = player.hitPoints;
    }
    // Display animation for healing
    document.getElementById('back-roll').textContent = `${healing}`;
    await sleep(2000);
    document.getElementById("player-card").classList.remove("player-card-flip");
    document.getElementById("monster-card").classList.remove("dim");
    await sleep(700);
    document.getElementById(`player-damage-taken`).textContent = `+${healing}`;
    document.getElementById(`player-damage-taken`).classList.add("damage-taken");
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
        document.getElementById("monster-card").classList.add("hide-monster");
        await sleep(2000);
        document.getElementById("monster-card-front").classList.remove(`monster-${currentMonster.cardImage}`);
        currentMonster = null;
        isPlayerTurn = true;
    } else {
        // It is now the monsters turn, it will attack you!
        // Bring the monster card above the player's
        document.getElementById('top-area').classList.add('on-top');
        // Reset the flags for hit, crit and damage
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
 * Copies the stats from a monster in the monster array
 * @param {*} monster 
 * @returns 
 */
function copyMonster(monster) {
    return Object.assign({}, monster);
}

/**
 * @returns the stats of a random monster from the monster array
 */
function selectRandomMonster() {
    return monsters[Math.floor(Math.random() * monsters.length)];
}

/**
 * Reads the hit dice(s) of the creature and adds them together
 * @param {*} creature 
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
 * @param {*} dice 
 * @returns random number between 1 and the input number
 */
function rollDice(dice) {
    let roll = Math.floor(Math.random() * dice) + 1;
    return roll
}

/**
 * Updates the UI for both the player and the current monster
 */
function updateUI() {
    // Update players HP
    if (player.currentHitPoints <= 0){
        player.currentHitPoints = 0;
    }
    document.getElementById('player-hp').textContent = player.currentHitPoints;
    document.getElementById('player-ac').textContent = player.armorClass;
    // Update monsters HP
    if (currentMonster == null) {
        document.getElementById('monster-hp').textContent = '';
        document.getElementById('monster-ac').textContent = '';
    } else {
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
 * Function to play the attack animation
 * @param {*} isPlayerTurn 
 * @param {*} damage 
 * @param {*} crit 
 */
async function hitAnimation(isPlayerTurn, damage, crit)  {
	let attacker = null; // Used to suppress JSHint warning for unused variable
    let target = null; // Used to suppress JSHint warning for unused variable
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
        damage = "MISS!";
        document.getElementById(`${target}-damage-taken`).textContent = `${damage}`;
        document.getElementById(`${target}-damage-taken`).classList.add("damage-taken");
        await sleep(80);
        await sleep(100);
        document.getElementById(`${attacker}-card`).classList.remove(`${attacker}-attack-animation`);
        await sleep(800);
        document.getElementById(`${target}-damage-taken`).textContent = ``;
        document.getElementById(`${target}-damage-taken`).classList.remove("damage-taken");
    } else {
        if (crit) {
            document.getElementById(`${target}-damage-taken`).classList.add('damage-taken-critical');
        }
        document.getElementById(`${target}-card`).classList.add("damage-animation");
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
 * @param {*} dice 
 */
async function diceAnimation(dice) {
    for (let i = 0; i < 10; i++) {
        // Show a random number
        document.getElementById('back-roll').textContent = rollDice(20);
        await sleep(100);
    }
    // Show the actual roll
    document.getElementById('back-roll').textContent = `${dice}`;
  }

/**
 * Function to present the result to the user on the result card
 * @param {} dice 
 * @param {*} hit 
 * @param {*} crit 
 * @param {*} damage 
 */
async function displayResult(dice, hit, crit, damage) {
    document.getElementById('back-title').textContent = `YOUR TURN`;
    await sleep(700);
    diceAnimation(dice);
    await sleep(1800);
    if (hit) {
        if (crit) {
            document.getElementById('back-hit').classList.add('back-hit-critical');
            document.getElementById('back-hit').textContent = `CRITICAL HIT!`;
        } else {
            document.getElementById('back-hit').textContent = `HIT!`;
        }
    } else {
        document.getElementById('back-hit').textContent = `MISS!`;
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
    // Set text on start screen
    document.getElementById('back-title').textContent = `DUNGEONS & DICES`;
    document.getElementById('back-subtitle').textContent = `Hello adventurer!`;
    document.getElementById('back-text-upper').textContent = `Dwell into the dungeon, defeat as many monsters as you can.`;
    document.getElementById('back-text-lower').textContent = `How to play: During your turn you can either attack with the sword or drink a healing potion`;
    document.getElementById('start-btn').textContent = `START`;
    // Flip the player card
    document.getElementById("player-card").classList.add("player-card-flip");
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
    // remove the monster card
    document.getElementById("monster-card").classList.add("hide-monster");
    document.getElementById("attack-btn").classList.add("hidden");
    document.getElementById("ability-btn").classList.add("hidden");
    // flip the player card
    document.getElementById("player-card").classList.add("player-card-flip");
    await sleep(850);
    document.getElementById("start-btn").classList.add("button-fade");
    // display the game over text and final score
    document.getElementById('back-title').textContent = `GAME OVER`;
    document.getElementById('back-subtitle').textContent = `Our hero has perished`;
    document.getElementById('back-text-upper').textContent = `Score:`;
    document.getElementById('back-roll').textContent = `${score}`;
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
    document.getElementById("start-btn").classList.add("hidden");
    await sleep(850);
    document.getElementById("attack-btn").classList.remove("hidden");
    document.getElementById("ability-btn").classList.remove("hidden");
    resetResults();
    // restart gameLoop();
    gameLoop();
}