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
        attackPower: 5,
    },
    {
        name: "Orc",
        hitPoints: 15,
        currentHitPoints: 15,
        armorClass: 13,
        attackPower: 9,
    },
];

// Flag to indicate whose turn it is
let isPlayerTurn = true;
let currentMonster = null;

// Player turn function
function playerTurn() {
    console.log("PLAYERS TURN") // REMOVE THIS
    let crit = false;
    let diceRoll = d20()
    if (diceRoll === 20) {
        console.log("CRITICAL HIT!") // REMOVE THIS
        crit = true;
    }
    let attackRoll = diceRoll + player.toHit;
    console.log(`Dice roll: ${diceRoll}`); // REMOVE THIS
    if (attackRoll > currentMonster.armorClass) {
        let damage = rollForDamage(player, crit);
        console.log(`HIT! You dealt ${damage} in damage`) // REMOVE THIS
        currentMonster.hitPoints -= damage;
    } else {
        console.log("MISS!") // REMOVE THIS
    }
    displayresult(diceRoll);
    isPlayerTurn = false;
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
        console.log("MONSTERS TURN") // REMOVE THIS
        let dice = d20();
        console.log(`Dice roll: ${dice}`); // REMOVE THIS
    };
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
    if (isPlayerTurn) {
    // It's the player's turn
    // Wait for the player to take it's action
    let playerActionBtn = document.getElementById('attack');
    playerActionBtn.addEventListener('click', playerTurn);
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

function displayresult(dice) {
    document.getElementById('result').textContent = `You rolled a ${dice}`;
};