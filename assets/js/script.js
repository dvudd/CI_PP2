// Wait for the DOM to finish loading before running the game
document.addEventListener("DOMContentLoaded", function() {
    gameLoop();
});

// Player stats
const player = {
    name: "Adventurer",
    hitPoints: 100,
    currentHitPoints: 100,
    armorClass: 13,
    toHit: 5,
    numDices: 1,
    hitDice: d12,
    plusDmg: 3,
};
  
// Monster stats
const monsters = [
    {
        name: "Goblin",
        hitPoints: 7,
        currentHitPoints: 7,
        armorClass: 15,
        toHit: 4,
        numDices: 1,
        hitDice: d6,
        plusDmg: 2,
    },
    {
        name: "Orc",
        hitPoints: 15,
        currentHitPoints: 15,
        armorClass: 13,
        toHit: 5,
        numDices: 1,
        hitDice: d12,
        plusDmg: 3,
    },
];

// Flag to indicate whose turn it is
let isPlayerTurn = true;
let currentMonster = null;
let buttonClicked = false;

// Player turn function
async function playerTurn() {
    // Prevent the button to be pressed several times
    function onPlayerActionClick() {
        playerActionBtn.removeEventListener('click', onPlayerActionClick);
        playerAttack();
    }
    // Listener for attack button
    let playerActionBtn = document.getElementById('attack');
    playerActionBtn.addEventListener('click', onPlayerActionClick);
}

// Player attack function
async function playerAttack() {
    console.log("PLAYERS TURN") // REMOVE THIS
    // Open the result card and dim the background
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    // Reset the flags for hit, crit and damage
    let hit = false;
    let crit = false;
    let damage = 0;
    // Roll for attack
    let diceRoll = d20()
    // Check if it's a Critical Roll
    if (diceRoll === 20) {
        console.log("CRITICAL HIT!") // REMOVE THIS
        crit = true;
    }
    // Check if it hits
    let attackRoll = diceRoll + player.toHit;
    console.log(`Dice roll: ${diceRoll}`); // REMOVE THIS
    if (attackRoll > currentMonster.armorClass) {
        // Calculate Damage
        hit = true;
        damage = rollForDamage(player, crit);
        console.log(`HIT! You dealt ${damage} in damage`) // REMOVE THIS
        currentMonster.hitPoints -= damage;
    } else {
        console.log("MISS!") // REMOVE THIS
    }
    // Display the results
    displayResult(diceRoll, hit, crit, damage);
    document.getElementById('monster-hp').textContent = currentMonster.hitPoints;
    isPlayerTurn = false;
    // await waitForButton("result-btn");
    await sleep(3000);
    // Close the result card and brighten the background
    document.getElementById("player-card").classList.toggle("player-card-flip");
    document.getElementById("monster-card").classList.toggle("dim");
    if (hit) {
        await sleep(1000);
        document.getElementById("player-card").classList.toggle("player-attack-animation");
        await sleep(150);
        document.getElementById("monster-card").classList.toggle("damage-taken");
        await sleep(80);
        document.getElementById("monster-card").classList.toggle("damage-taken");
        await sleep(100);
        document.getElementById("player-card").classList.toggle("player-attack-animation");
    }
    resetResults()
    gameLoop();
}

// Monsters turn function
function monsterTurn() {
    // First lets check if the monster is still alive.
    if (currentMonster.hitPoints <= 0) {
        console.log(`${currentMonster.name} was defeated!`); // REMOVE THIS
        currentMonster = null;
        isPlayerTurn = true;
    } else {
        // It is now the monsters turn, it will attack you!
        console.log("MONSTERS TURN") // REMOVE THIS
        let crit = false;
        let diceRoll = d20()
        if (diceRoll === 20) {
            console.log("CRITICAL HIT!") // REMOVE THIS
            crit = true;
        }
        let attackRoll = diceRoll + player.toHit;
        console.log(`Dice roll: ${diceRoll}`); // REMOVE THIS
        if (attackRoll > player.armorClass) {
            let damage = rollForDamage(currentMonster, crit);
            console.log(`HIT! ${currentMonster.name} dealt ${damage} in damage`) // REMOVE THIS
            player.hitPoints -= damage;
        } else {
            console.log("MISS!") // REMOVE THIS
        }
    };
    document.getElementById('player-hp').textContent = player.hitPoints;
    isPlayerTurn = true;
    gameLoop();
}

/**
 * The main game loop, called when the script is first loaded
 * and after the the player of monster has taken its turn
 */
function gameLoop() {
    if (currentMonster === null) {
        // If there's no current monster, select a random one
        currentMonster = copyMonster(selectRandomMonster());
        console.log(`=======================================`) // REMOVE THIS
        console.log(`You are facing a ${currentMonster.name}`) // REMOVE THIS
      }
    document.getElementById('monster-hp').textContent = currentMonster.hitPoints;
    document.getElementById('monster-ac').textContent = currentMonster.armorClass;
    document.getElementById('player-hp').textContent = player.hitPoints;
    document.getElementById('player-ac').textContent = player.armorClass;
    if (isPlayerTurn) {
        // It's the player's turn
        playerTurn();
    } else {
        // It's the monster's turn
        monsterTurn(); // Trigger the monster's turn
    };

    // Here the game shoud update the UI
    // and check for game over conditions
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
    for (let i=0; i <= creature.numDices; i++) {
        damage += creature.hitDice() + creature.plusDmg;
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
};

/**
 * Simulates a roll of a d6 dice,
 * gives a random number between 1-6
 */
function d6() {
    let dice = Math.floor(Math.random() * 6) + 1;
    return dice;
};

/**
 * Simulates a roll of a d10 dice,
 * gives a random number between 1-10
 */
function d10() {
    let dice = Math.floor(Math.random() * 10) + 1;
    return dice;
};

/**
 * Simulates a roll of a d12 dice,
 * gives a random number between 1-12
 */
function d12() {
    let dice = Math.floor(Math.random() * 12) + 1;
    return dice;
};

/**
 * Simulates a roll of a d20 dice,
 * gives a random number between 1-20
 */
function d20() {
    let dice = Math.floor(Math.random() * 20) + 1;
    return dice;
};

/**
 * Holds execution of code until the provided button is pressed.
 * @param {*} buttonId 
 * @returns 
 */
function waitForButton(buttonId) {
    return new Promise(resolve => {
        document.getElementById(buttonId).addEventListener('click', function onButtonClick() {
            buttonClicked = true;
            resolve();
            document.getElementById(buttonId).removeEventListener('click', onButtonClick);
        });
    });
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
 * Function to present the result to the user on the result card
 * @param {} dice 
 * @param {*} hit 
 * @param {*} crit 
 * @param {*} damage 
 */
async function displayResult(dice, hit, crit, damage) {
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
};

/**
 * Clears the text on the result card
 */
function resetResults() {
    document.getElementById('result-roll').textContent = ``;
    document.getElementById('result-hit').textContent = ``;
    document.getElementById('result-damage').textContent = ``;
}