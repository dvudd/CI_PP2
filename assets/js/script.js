// JavaScript code goes here

document.addEventListener("DOMContentLoaded", function() {
    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function() {
            if (this.getAttribute("data-type") === "roll-dice") {
                rollDice();
            } else {
                // TODO
            }
        });
    }

});

function rollDice() {
    let dice = Math.floor(Math.random() * 20) + 1;
    displayresult(dice);
    console.log(`Dice roll: ${dice}`); // REMOVE THIS
};

function displayresult(dice) {
    document.getElementById('result').textContent = `You rolled a ${dice}`;
};