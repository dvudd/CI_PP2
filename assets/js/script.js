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
    attackPower: 10,
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

// Player turn function
function playerTurn() {
    console.log("PLAYERS TURN")
    let dice = d20();
    console.log(`Dice roll: ${dice}`); // REMOVE THIS
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