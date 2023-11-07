/*jshint esversion: 8 */ // REMOVE THIS
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
    currentHitPoints: 10, // ÄNDRA TILLBAKA TILL 100
    armorClass: 13,
    toHit: 5,
    numDices: 1,
    hitDice: d4(), // ÄNDRA TILLBAKA TILL D20()
    plusDmg: 3,
};
  
/**
 * Monster statistics
 */
const monsters = [
    {
        name: "Goblin",
        hitPoints: 7,
        currentHitPoints: 7,
        armorClass: 15,
        toHit: 4,
        numDices: 1,
        hitDice: d6(),
        plusDmg: 2,
    },
    {
        name: "Orc",
        hitPoints: 15,
        currentHitPoints: 15,
        armorClass: 13,
        toHit: 5,
        numDices: 1,
        hitDice: d12(),
        plusDmg: 3,
    },
];

// Flag to indicate whose turn it is
let isPlayerTurn = true;
let currentMonster = null;
let score = 0;

/**
 * Main game loop
 */
async function gameLoop() {
    while(player.currentHitPoints > 0) {
        if (currentMonster === null) {
            // If there's no current monster, select a random one
            currentMonster = copyMonster(selectRandomMonster());
            document.getElementById('monster-name').textContent = currentMonster.name;
            document.getElementById("monster-card").classList.toggle("monster-alive");
            console.log(`========== NEW ENCOUNTER ==========`); // REMOVE THIS
            console.log(`You are facing a ${currentMonster.name}`); // REMOVE THIS
          }
        // Update the players HP and AC on the player card
        document.getElementById('player-hp').textContent = player.currentHitPoints;
        document.getElementById('player-ac').textContent = player.armorClass;
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
 * Displays the game over screen with the players final score.
 */
function gameOver() {
    console.log("YOU DIED"); // REMOVE THIS
    // remove the monster card
    document.getElementById("monster-card").classList.toggle("monster-alive");
    // flip the player card
    document.getElementById("player-card").classList.toggle("player-card-flip");
    // display the game over text and final score
    document.getElementById('result-title').textContent = `GAME OVER`;
    document.getElementById('result-hit').textContent = `Our hero has perished`;
    document.getElementById('result-damage').textContent = `Score: ${score}`;
    // Display the restart button
    document.getElementById('start-btn').textContent = `RESTART`;
    document.getElementById("start-btn").classList.toggle("hidden");
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
    isPlayerTurn = true;
    // Flip the player card down again and clear the card
    document.getElementById("player-card").classList.toggle("player-card-flip");
    await sleep(700);
    document.getElementById("start-btn").classList.toggle("hidden");
    resetResults();
    // restart gameLoop();
    gameLoop();
}

/**
 * Player turn function.
 * Listen for the player to do an action
 */
async function playerTurn() {
    console.log("PLAYERS TURN"); // REMOVE THIS
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
 * If hit, then roll damage die and attack.
 */
async function playerAttack() {
    console.log(`Current score: ${score}`); // REMOVE THIS
    // Flip the player card and dim the monster card
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    // Reset the flags for hit, crit and damage
    let hit = false;
    let crit = false;
    let damage = 0;
    // Roll for attack
    let diceRoll = d20();
    // Check if it's a Critical Roll
    if (diceRoll === 20) {
        console.log("CRITICAL HIT!"); // REMOVE THIS
        crit = true;
    }
    // Add the players toHit to the attack roll
    let attackRoll = diceRoll + player.toHit;
    console.log(`Dice roll: ${diceRoll}`); // REMOVE THIS
    // Check if it's enough to hit, Critical Hits always hits
    if ((attackRoll > currentMonster.armorClass) || (crit)) {
        // Calculate Damage
        hit = true;
        damage = rollForDamage(player, crit);
        console.log(`HIT! You dealt ${damage} in damage`); // REMOVE THIS
        score += damage;
        currentMonster.hitPoints -= damage;
    } else {
        console.log("MISS!"); // REMOVE THIS
    }
    // Display the results
    displayResult(diceRoll, hit, crit, damage);
    await sleep(3000);
    // Close the result card and brighten the background
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    // If the attack hits, play the attack animation
    if (hit) {
        await hitAnimation(isPlayerTurn, damage, crit);
    }
    await sleep(700);
    // Reset for the next turn
    isPlayerTurn = false;
    resetResults();
}

/**
 * Player ability function.
 * This will roll 4d4 +4 and heal the player for the amount.
 */
async function playerAbility() {
    console.log("Player pressed the ability button"); // REMOVE THIS
    // Flip the player card and dim the monster card
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    await sleep(700);
    document.getElementById('result-roll').textContent = `You drink a potion!`;
    await sleep(1000);
    // Roll 4d4 + 4
    let healing = d4() + d4() + d4() + d4() + 4;
    player.currentHitPoints += healing;
    // Prevent players hitpoints to be more than its max value
    if (player.currentHitPoints > player.hitPoints) {
        player.currentHitPoints = player.hitPoints;
    }
    // Display animation for healing
    document.getElementById('result-damage').textContent = `You recover ${healing} HP`;
    await sleep(2000);
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    await sleep(700);
    document.getElementById(`player-damage-taken`).textContent = `+${healing}`;
    document.getElementById(`player-damage-taken`).classList.toggle("damage-taken");
    await sleep(500);
    document.getElementById('player-hp').textContent = player.currentHitPoints;
    document.getElementById(`player-damage-taken`).textContent = ``;
    document.getElementById(`player-damage-taken`).classList.toggle("damage-taken");
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
        console.log(`${currentMonster.name} was defeated!`); // REMOVE THIS
        currentMonster = null;
        document.getElementById("monster-card").classList.toggle("monster-alive");
        await sleep(2000);
        isPlayerTurn = true;
    } else {
        // It is now the monsters turn, it will attack you!
        console.log("MONSTERS TURN"); // REMOVE THIS
        // Bring the monster card above the player's
        document.getElementById('top').classList.toggle('on-top');
        // Reset the flags for hit, crit and damage
        let crit = false;
        let damage = 0;
        // Roll for attack
        let diceRoll = d20();
        // Check if it's a Critical Roll
        if (diceRoll === 20) {
            console.log("CRITICAL HIT!"); // REMOVE THIS
            crit = true;
        }
        // Add the monsters toHit to the attack roll
        let attackRoll = diceRoll + currentMonster.toHit;
        console.log(`Dice roll: ${diceRoll}`); // REMOVE THIS
        // Check if it's enough to hit, Critical Hits always hits
        if ((attackRoll > player.armorClass) || (crit)) {
            damage = rollForDamage(currentMonster, crit);
            console.log(`HIT! ${currentMonster.name} dealt ${damage} in damage`); // REMOVE THIS
            player.currentHitPoints -= damage;
        } else {
            console.log("MISS!"); // REMOVE THIS
        }
        // Play the attack animation
        await hitAnimation(isPlayerTurn, damage, crit);
        await sleep(700);
        // Bring the monster card back
        document.getElementById('top').classList.toggle('on-top');
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
    for (let i=0; i < creature.numDices; i++) {
        damage += creature.hitDice + creature.plusDmg;
    }
    if (crit) {
        damage = damage * 2;
    }
    return damage;
}

/**
 * Simulates a roll of a d4 dice,
 * gives a random number between 1-4
 */
function d4() {
    let dice = Math.floor(Math.random() * 4) + 1;
    return dice;
}

/**
 * Simulates a roll of a d6 dice,
 * gives a random number between 1-6
 */
function d6() {
    let dice = Math.floor(Math.random() * 6) + 1;
    return dice;
}

/**
 * Simulates a roll of a d10 dice,
 * gives a random number between 1-10
 */
function d10() {
    let dice = Math.floor(Math.random() * 10) + 1;
    return dice;
}

/**
 * Simulates a roll of a d12 dice,
 * gives a random number between 1-12
 */
function d12() {
    let dice = Math.floor(Math.random() * 12) + 1;
    return dice;
}

/**
 * Simulates a roll of a d20 dice,
 * gives a random number between 1-20
 */
function d20() {
    let dice = Math.floor(Math.random() * 20) + 1;
    return dice;
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
    document.getElementById(`${attacker}-card`).classList.toggle(`${attacker}-attack-animation`);
    await sleep(150);
    if (damage === 0) {
        damage = "MISS!";
        document.getElementById(`${target}-damage-taken`).textContent = `${damage}`;
        document.getElementById(`${target}-damage-taken`).classList.toggle("damage-taken");
        await sleep(80);
        await sleep(100);
        document.getElementById(`${attacker}-card`).classList.toggle(`${attacker}-attack-animation`);
        await sleep(800);
        document.getElementById(`${target}-damage-taken`).textContent = ``;
        document.getElementById(`${target}-damage-taken`).classList.toggle("damage-taken");
    } else {
        document.getElementById(`${target}-card`).classList.toggle("damage-animation");
        document.getElementById(`${target}-damage-taken`).textContent = `-${damage}`;
        document.getElementById(`${target}-damage-taken`).classList.toggle("damage-taken");
        await sleep(80);
        document.getElementById(`${target}-card`).classList.toggle("damage-animation");
        await sleep(100);
        document.getElementById(`${attacker}-card`).classList.toggle(`${attacker}-attack-animation`);
        await sleep(800);
        document.getElementById(`${target}-damage-taken`).textContent = ``;
        document.getElementById(`${target}-damage-taken`).classList.toggle("damage-taken");
    }
}

/**
 * Function to present the result to the user on the result card
 * @param {} dice 
 * @param {*} hit 
 * @param {*} crit 
 * @param {*} damage 
 */
async function displayResult(dice, hit, crit, damage) {
    document.getElementById('result-title').textContent = `YOUR TURN`;
    await sleep(700);
    document.getElementById('result-roll').textContent = `You rolled a ${dice}`;
    await sleep(1000);
    if (hit) {
        if (crit) {
            document.getElementById('result-hit').textContent = `CRITICAL HIT!`;
        } else {
            document.getElementById('result-hit').textContent = `HIT!`;
        }
        await sleep(1000);
        document.getElementById('result-damage').textContent = `You dealt ${damage} damage`;
    } else {
        document.getElementById('result-hit').textContent = `MISS!`;
    }
}

/**
 * Clears the text on the result card
 */
function resetResults() {
    document.getElementById('result-title').textContent = ``;
    document.getElementById('result-roll').textContent = ``;
    document.getElementById('result-hit').textContent = ``;
    document.getElementById('result-damage').textContent = ``;
}