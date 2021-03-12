// TODO - check messages, add race and feat recognition, add undo isPrevPointAssigned
const Discord = require('discord.js');

const auth = require('./auth.json'); // Load up the token
const config = require('./config.json');

const bot = new Discord.Client();
bot.on('ready', () => {
    console.log('Stats bot is ready');
});
bot.on('error', (e) => console.error(e));
bot.on('warn', (e) => console.warn(e));
bot.on('debug', (e) => console.info(e));
bot.on('disconnect', () => {
    bot.connect(); // Will reconnect
});

bot.login(auth.token);

const commandPing = 'ping';
const commandHelp = 'help';
const commandRoll = 'roll';
const commandRollEx = 'roll #d#';
const commandReset = 'reset';
const commandHybrid = 'hybrid';
const commandSoftcore = 'softcore';
const commandHardcore = 'hardcore';
const commandHybridEx = 'hybrid softcore _ _ _ _ _ _ or hybrid hardcore _ _ _ _ _ _ where _ is a letter a, b, c, or d';
const commandContingency = 'contingency';
const commandContingencyEx = 'contingency # # # # # #, where an existing value of under 8 will be increased by 3, a value under 15 will be increased by 2, and a value under 18 will be increased by 1.';
const commandAssign = 'assign';
const commandAssignEx = 'assign _ _ _ _ _ _, where each _ is STR, INT, WIS, DEX, CON, or CHA.'
const commandRacial = 'race';
const commandRacialEx = 'race # # # # # # or race name-of-race';
const commandFeat = 'feat';
const commandFeatEx = 'feat # # # # # # or feat name-of-feat';
const commandUndo = 'undo';

const NAME_ARRAY = config.nameArray; // ['Strength', 'Intelligence', 'Wisdom', 'Dexterity', 'Constitution', 'Charisma'];
const UNDEF_NAME_ARRAY = ['---', '---', '---', '---', '---', '---'];
let currentNameArray = NAME_ARRAY; // TODO use in case they mess up the order

let pointArray = [0, 0, 0, 0, 0, 0];
let prevPointArray = pointArray;
let isPrevPointAssigned = true;
let isHardcore = false;
let remainingContingencyPoints = 0;

bot.on('message', message => {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    // split around spaces
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log("ARGS ARE " + args);

    switch (command) {
        case commandPing:
            message.channel.send('pong!');
            break;
        case commandHelp:
            message.channel.send(config.helpText)
            break;
        case commandRoll:
            message.channel.send(rollIteratively(args));
            break;
        case commandReset:
            pointArray = [0, 0, 0, 0, 0, 0];
            message.channel.send(config.resetText);
            break;
        case commandHybrid:
            pointArray = [0, 0, 0, 0, 0, 0];
            prevPointArray = pointArray;
            message.channel.send(hybrid(args, pointArray));
            console.log("point array: " + pointArray);
            break;
        case commandContingency:
            prevPointArray = pointArray;
            message.channel.send(spendContingencyPoints(pointArray, args, isHardcore, currentNameArray));
            break;
        case commandAssign:
            message.channel.send(assignAttributes(pointArray, args, remainingContingencyPoints, isHardcore));
            break;
        case commandRacial:
            prevPointArray = pointArray;
            message.channel.send(addRacialBonuses(pointArray, args, remainingContingencyPoints, currentNameArray));
            break;
        case commandFeat:
            prevPointArray = pointArray;
            message.channel.send(addFeatBonuses(pointArray, args, remainingContingencyPoints, currentNameArray));
            break;
        case commandUndo:
            pointArray = prevPointArray;

        default:
            message.channel.sent(config.unrecognized);
    }

});

function pointArrayMessage(nextMessage = '', array = [0, 0, 0, 0, 0, 0], nameArray = NAME_ARRAY, color = '#0099ff') {
    return new Discord.MessageEmbed()
        .setColor(color)
        .addFields({
            name: nameArray[0],
            value: array[0]
        }, {
            name: nameArray[1],
            value: array[1]
        }, {
            name: nameArray[2],
            value: array[2]
        }, {
            name: nameArray[3],
            value: array[3]
        }, {
            name: nameArray[4],
            value: array[4]
        }, {
            name: nameArray[5],
            value: array[5]
        })
        .setDescription(nextMessage);
}

function errorMessage(nextMessage = '', color = '#aaaaaa') {
    // TODO - run command undo
    return new Discord.MessageEmbed()
        .setColor(color)
        .setDescription('Error: ' + nextMessage);
}

// Commands
// Rolling  ===============================================================================================

function rollIteratively(args = ['1d1']) {
    let runningTotal = 0;
    let mess = '';
    let nextOperation = '+';
    args.forEach(arg => {
        let splitArgByOperation = arg.split(/([+-/*])/g);
        splitArgByOperation.forEach((lilArg) => {
            if (lilArg.match(/d/)) {
                let obj = rollIterations(lilArg.trim());
                runningTotal = doMath(runningTotal, nextOperation, obj.total);
                mess += ' ' + obj.message;
            } else if (lilArg != '') {
                nextOperation = lilArg.trim();
                mess += ' ' + nextOperation;
            }
        });
    });
    return mess + '\n' + runningTotal;
}

function doMath(number, op = '+', num = 0) {
    switch (op) {
        case '-':
            return number - num;
        case '*':
            return number * num;
        case '/':
            return number / num;
        default:
            return number + num;
    }
}

function rollIterations(args = '1d1') {
    const [iterations, dice] = args.split('d');
    if (iterations == null || iterations == '') {
        iterations = 1;
    }
    let mess = iterations > 1 ? '(' : '';
    let total = 0;

    for (let i = 0; i < iterations; i++) {
        let rollResult = roll(dice);
        total += rollResult;
        if (i != 0) {
            mess += ' + ';
        }
        mess += rollResult;
    }
    if (iterations > 1) mess += ')';
    return {
        total: total,
        message: mess
    };
}

function roll(die = 1) {
    let ret = Math.floor(Math.random() * die + 1);
    console.log("rolling " + die + " die = " + ret);
    return ret;
}

// Roll Stats  ===============================================================================================

function hybrid(args, ret) {
    remainingContingencyPoints = 0;

    switch (args[0]) {
        case commandSoftcore:
            isPrevPointAssigned = false;
            remainingContingencyPoints = contingencyOfSoftcore(args.slice(1));
            break;
        case commandHardcore:
            isHardcore = true;
            remainingContingencyPoints = contingencyOfHardcore(args.slice(1));
            break;
        default:
            return config.unrecognizedHybrid;
    }

    if (remainingContingencyPoints < 0) {
        return errorMessage(config.hybridPointBuyError);
    }

    currentNameArray = isHardcore ? NAME_ARRAY : UNDEF_NAME_ARRAY;

    for (i = 1; i < args.length; i++) {
        let rollRes;
        switch (args[i]) {
            case 'a':
                rollRes = roll(6);
                ret[i - 1] = 15 + Math.floor(rollRes / 2);
                console.log("A: 15  + 1/2 * " + rollRes + " = " + ret[i - 1]);
                break;
            case 'b':
                rollRes = roll(4);
                ret[i - 1] = 10 + 2 * rollRes;
                console.log("B: 10 + 2 * " + rollRes + " = " + ret[i - 1]);
                break;
            case 'c':
                rollRes = roll(6);
                ret[i - 1] = 6 + 2 * rollRes;
                console.log("C: 6 + 2 * " + rollRes + " = " + ret[i - 1]);
                break;
            default:
                rollRes = roll(6);
                ret[i - 1] = 3 * rollRes;
                console.log("D: 3 * " + rollRes + " = " + ret[i - 1]);
        }
    }

    return pointArrayMessage(buildNextContingencyMessage(remainingContingencyPoints, isHardcore), ret, currentNameArray)
}

function contingencyOfSoftcore(letterArray) {
    return getContingencyRemaining(letterArray, 6);
}

function contingencyOfHardcore(letterArray) {
    return getContingencyRemaining(letterArray, 7);
}

function getContingencyRemaining(letterArray, totalPoints) {
    let totalCost = 0;
    letterArray.forEach(letter =>
        totalCost += getLetterPointCost(letter)
    );
    console.log("contingency points cost: " + totalCost + " remaining: " + totalPoints);
    return totalPoints - totalCost;
}

function getLetterPointCost(letter) {
    switch (letter) {
        case 'a':
            return 3;
        case 'b':
            return 2;
        case 'c':
            return 1;
        default:
            return 0;
    }
}

// Point Buy ===============================================================================================

function spendContingencyPoints(numberArray, contPointArray, isUsingHardcore, nameArray) {
    console.log("number array: " + numberArray);
    console.log("contingency array: " + contPointArray);
    console.log("remainingContingencyPoints: " + remainingContingencyPoints);
    for (i = 0; i < numberArray.length && remainingContingencyPoints > 0; i++) {
        if (remainingContingencyPoints < contPointArray[i]) {
            // cannot spend more contingency points than have
            numberArray[i] = addContingencyPoint(numberArray[i], remainingContingencyPoints);
        } else {
            numberArray[i] = addContingencyPoint(numberArray[i], contPointArray[i]);
        }
        remainingContingencyPoints -= contPointArray[i];
    }
    if (remainingContingencyPoints > 0) {
        return pointArrayMessage(buildNextContingencyMessage(remainingContingencyPoints, isUsingHardcore), numberArray, nameArray);
    }
    return pointArrayMessage(isUsingHardcore ? buildNextRacialMessage() : buildNextAssignMessage(), numberArray, nameArray);
}

function addContingencyPoint(existingValue, pointsToSpend) {
    console.log("pointsToSpend: " + pointsToSpend);
    while (pointsToSpend > 0) {
        if (existingValue < 8) {
            console.log("adding points: 3 + " + existingValue);
            existingValue += 3;
        } else if (existingValue < 15) {
            console.log("adding points: 2 + " + existingValue);
            existingValue += 2;
        } else if (existingValue < 18) {
            console.log("adding points: 1 + " + existingValue);
            existingValue += 1;
        }
        pointsToSpend--;
    }
    return existingValue;
}

// Assign Attributes (Softcore only)  ===============================================================================================

function assignAttributes(numberArray, attrArray, contPointsRemaining, isUsingHardcore) {
    if (!isUsingHardcore) {
        copyOfNumber = [...numberArray];
        for (i = 0; i < attrArray.length; i++) {
            numberArray[getIndexOfAttribute(attrArray[i])] = copyOfNumber[i];
        }
        currentNameArray = NAME_ARRAY;
        isPrevPointAssigned = true; // TODO - check for undo
    }
    if (remainingContingencyPoints > 0) {
        return pointArrayMessage(buildNextContingencyMessage(contPointsRemaining, true), numberArray, currentNameArray);
    }
    return pointArrayMessage(buildNextRacialMessage(contPointsRemaining), numberArray, currentNameArray);
}

function getIndexOfAttribute(attr) {
    switch (attr) {
        case 'STR':
            return 0;
        case 'INT':
            return 1;
        case 'WIS':
            return 2;
        case 'DEX':
            return 3;
        case 'CON':
            return 4;
        case 'CHA':
            return 5;
        default:
            return 'ERROR - undo'; // TODO - undo here
    }
}

// Racial Bonuses  ===============================================================================================

function addRacialBonuses(numberArray, racialArgs, contPointsRemaining, nameArray) {
    // check for recognized race
    // else validate length of array
    addValues(numberArray, racialArgs);

    return pointArrayMessage(buildNextFeatMessage(contPointsRemaining), numberArray, nameArray);
}

function addValues(numberArray, addFromArray) {
    for (i = 0; i < numberArray.length; i++) {
        numberArray[i] += parseInt(addFromArray[i]);
    }
    return numberArray;
}

// Feat Bonuses  ===============================================================================================

// TODO - this bit is buggy
function addFeatBonuses(numberArray, featArgs, nameArray) {
    // check for recognized race
    // else validate length of array
    addValues(numberArray, featArgs);
    return pointArrayMessage('', numberArray, nameArray);
}

// Messages  ===============================================================================================

function buildNextContingencyMessage(contPointsRemaining, isAssigned) {
    if (contPointsRemaining == 0) {
        return isAssigned ? buildnextRacialMessage() : buildNextAssignMessage();
    }
    message = contPointsRemaining + ' ';
    if (contPointsRemaining == 1) {
        message = message + config.singularContingencyPointsRemaining;
    } else {
        message = message + config.pluralContingencyPointsRemaining;
    }
    return message + '\n' + config.nextContingencyMessage + commandContingencyEx;
}

function buildNextAssignMessage(contPointsRemaining) {
    if (contPointsRemaining > 0) {
        return buildNextContingencyMessage(contPointsRemaining, true);
    }
    return config.nextAssignMessage + commandAssignEx;
}

function buildNextRacialMessage(contPointsRemaining) {
    if (contPointsRemaining > 0) {
        return buildNextContingencyMessage(contPointsRemaining, true);
    }
    return config.nextRacialMessage + commandRacialEx;
}

function buildNextFeatMessage(contPointsRemaining) {
    if (contPointsRemaining > 0) {
        return buildNextContingencyMessage(contPointsRemaining, true);
    }
    return config.nextFeatMessage + commandFeatEx;
}