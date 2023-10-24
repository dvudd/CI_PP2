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
    console.log("PLAYERS TURN")
    let dice = d20() + player.toHit;
    console.log(`Dice roll: ${dice}`); // REMOVE THIS
    if (dice > currentMonster.armorClass) {
        let damage = rollForDamage(player);
        console.log(`HIT! You dealt ${damage} in damage`)
    } else {
        console.log("MISS!")
    }
    displayresult(dice);
    isPlayerTurn = false;
    gameLoop();
}

// Monsters turn function
function monsterTurn() {
    console.log("MONSTERS TURN")
    let dice = d20();
    console.log(`Dice roll: ${dice}`); // REMOVE THIS
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
        currentMonster = selectRandomMonster();
        console.log(`You are facing a ${currentMonster.name}`)
      }
    if (isPlayerTurn) {
    // It's the player's turn
    // Wait for the player to take it's action
    let playerActionBtn = document.getElementById('attack');
    playerActionBtn.addEventListener('click', playerTurn);
    } else {
    // It's the monster's turn
    monsterTurn(); // Trigger the monster's turn
    }

    // Here the game shoud update the UI
    // and check for game over conditions
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
function rollForDamage(creature) {
    let damage = creature.hitDice() + creature.plusDmg;
    return damage;
}

/**
 * Simulates a roll of a d12 dice,
 * gives a random number between 1-20
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