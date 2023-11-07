# DUNGEONS AND DICES
**BILD FRÅN AMIRESPONSIVE**
[DUNGEONS and DICES](https://dvudd.github.io/CI_PP2/) is a turned-based dungeon crawler where the player fights their way through enemies.
## User Stories
As a first time user I want to: 
As a returning user I want to: 
## Features

## Future Features
While the game is fully funcional there is many ways to improve the experience
- Selectable characters
	- A Fighter with high defense but medium damage
	- A Thief with a chance to dodge incoming damage
	- A Wizard with low defense but high damage spells
- More player abilites, with different cooldowns.
- Equipable items that the player can find along the way
	- Better weapons
	- Better Armor
	- Better healing potions
* More monster
* Boss battles!

## Testing
### Validator testing
#### HTML
No errors were returned when passing through the [W3C Markup validator](https://validator.w3.org/).
#### CSS
No errors were found when passing through the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/).
#### JavaScript
No errors were found when passing through the [JShint](https://jshint.com) analysis tool.
#### Google Chrome Lighthouse Reports
Här kommer lighthouse presenteras
### Manual testing
**Här ska jag lägga in de manuella tester jag gjort**
### Browser testing
- IOS Safari
- iPad Safari
- MacOS Safari
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
### Device Testing
- iPhone 11
- iPhone 11 Pro
- iPhone 12 Mini
- iPhone 13
- Macbook
- Windows 11 PC
### Bugs
<details><summary>Bug: No new monster is picked after the player defeats the current one</summary>

This was fixed by creating a function to make a copy of the randomly selected monster.
```js
currentMonster = copyMonster(selectRandomMonster());
/**
* Copies the stats from a monster in the monster array
* @param {*} monster
* @returns
*/
function copyMonster(monster) {
return Object.assign({}, monster);
}
```

</details>
<details><summary>Bug: The player can make multiple attacks in one turn by pressing the attack button twice</summary>

The EventListener for the attack button was in the `gameLoop()` function, but the EventListener was never disabled, making it possible to press the button in quick succession to run the `playerTurn()` function multiple times.
To fix this I moved the EventListener from the `gameLoop()`:
```js
if (isPlayerTurn) {
	 // It's the player's turn
	 // Wait for the player to take it's action
	 let playerActionBtn = document.getElementById('attack');
	 playerActionBtn.addEventListener('click', playerTurn);
	 }
```
To the `playerTurn()`function where the EventListener is removed when the user presses the button
```js
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
 The old `playerTurn()`function was renamed to `PlayerAttack()`
```

</details>
<details> <summary>Bug: Damage rolls are higher than intented</summary>

In the `rollForDamage()`function, the number of hit dices are looped to ensure the case where more than 1 hit dice is used. However there was a typo that caused the loop to roll 1 extra dice.
```js
for (let i=0; i <= creature.numDices; i++) {
		 damage += creature.hitDice + creature.plusDmg;
	 }
```
This was fixed by fixes the typo
```js
  for (let i=0; i < creature.numDices; i++) {
		 damage += creature.hitDice + creature.plusDmg;
	 }
```

</details>
<details><summary>Bug: Monsters damage is miscalculated</summary>

There was a typo in the `monsterTurn()`function.
This added the players toHit value to the monsters attack.
```js
let attackRoll = diceRoll + player.toHit;
```
This was fixed with:
```js
let attackRoll = diceRoll + currentMonster.toHit;
```

</details>
<details><summary>Bug: Damage is not calculated correctly</summary>

This bug was caused when I tried to clean up the code.
In commit `7330400` i changed the hitDice value in both the player and monster array from:
`hitDice: d10` to `hitDice: d10()` wich made the `d10()` function to be run once at the start of the game. To fix this I reverted changes.

</details>

### Known Bugs
**LÄGG TILL KÄNDA BUGGAR HÄR**
## Technologies used
- IDE: Microsoft VS code
- Repository: Github
- Image Editor: [PhotoPea](https://www.photopea.com)
### Languages
- HTML5
- CSS
- JavaScript
### Libraries
1. Font Awesome
	- Font Awesome was used to add icons on all pages for aesthetic reasons.
2. Google Fonts
	- Google Fonts was used to import the fonts **LÄGG TILL FONTS**
## Deployment
[Click here to view the project](https://dvudd.github.io/CI_PP2/)
### GitHub Pages
The project was deployed to GitHub Pages using the following steps:
1. Log in to GitHub and locate the [GitHub Repository](https://github.com/dvudd/CI_PP2)
2. At the top of the Repository (not top of page), locate the "Settings" Button on the menu.
3. Scroll down the Settings page until you locate the "GitHub Pages" Section.
4. Under "Source", click the dropdown called "None" and select "Master Branch".
5. The page will automatically refresh.
6. Scroll back down through the page to locate the now published site [link](https://github.com) in the "GitHub Pages" section.
### Forking the GitHub Repository
By forking the GitHub Repository we make a copy of the original repository on our GitHub account to view and/or make changes without affecting the original repository by using the following steps:
1. Log in to GitHub and locate the [GitHub Repository](https://github.com/dvudd/CI_PP2)
2. At the top of the Repository (not top of page) just above the "Settings" Button on the menu, locate the "Fork" Button.
3. You should now have a copy of the original repository in your GitHub account.
### Making a Local Clone
1. Log in to GitHub and locate the [GitHub Repository](https://github.com/dvudd/CI_PP2)
2. Under the repository name, click "Clone or download".
3. To clone the repository using HTTPS, under "Clone with HTTPS", copy the link.
4. Open Git Bash
5. Change the current working directory to the location where you want the cloned directory to be made.
6. Type `git clone`, and then paste the URL you copied in Step 3.
```

$ git clone https://github.com/dvudd/CI_PP2

```
7. Press Enter. Your local clone will be created.
8. Open `index.html` in your browser.
## Credits
Media:
-  Monster Assets was created by [Sagak art](https://sagak-art-pururu.itch.io)
	- [Card RPG) Monsters](https://sagak-art-pururu.itch.io/cardrpg-monsters)
	- [Card RPG) UI&Characters](https://sagak-art-pururu.itch.io/cardrpg-ui) **ANVÄNDS INTE**
	- [Card RPG) Items](https://sagak-art-pururu.itch.io/cardrpg-items)
	- [Card RPG) Icons&Objects](https://sagak-art-pururu.itch.io/cardrpg-icons) **ANVÄNDS INTE**
- Card assets was created by [cafeDraw](https://cafedraw.itch.io/fantasy-card-assets)
- Favicon was downloaded from [flaticon](https://www.flaticon.com/) and converted with [favicon.io](https://favicon.io/favicon-converter/)
Code:
- Sleep function: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
- popup function: https://www.youtube.com/watch?v=AF6vGYIyV8M
- Dim: https://stackoverflow.com/questions/67271053/adding-class-to-an-element-got-by-classname
- Card flip: https://www.w3schools.com/howto/howto_css_flip_card.asp
- Card Shake: https://www.w3schools.com/howto/howto_css_shake_image.asp
- Prevent scrolling: https://stackoverflow.com/questions/28411499/disable-scrolling-on-body
### Acknowledgements
![CI logo](https://codeinstitute.s3.amazonaws.com/fullstack/ci_logo_small.png)\
This is my Portfolio Project 2 as part of the Full Stack Software Developer program at [Code Institute](https://codeinstitute.net/).\
David Eriksson 2023