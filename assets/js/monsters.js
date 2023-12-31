/**
 * Monster statistics
 * This is a seperate file to easily add more monsters
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

export default monsters;