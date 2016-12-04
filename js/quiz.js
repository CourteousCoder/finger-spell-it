'use strict';
//All these objects used to be many variables.
//I grouped them for code organization.

var SPEEDS = [ //in milliseconds
	1000, //slow
	666, //medium
	333, //fast
	200 //Deaf
];
var FineTuneSpeedEnum = {
	INCREASE: 0,
	DECREASE: 1,
	STEADY: 2
}

var StateEnum = {
	LISTENING: 0,
	SIGNING: 1
};

var conversation = {
	playerState: StateEnum.LISTENING,
	score: 0,
	horizontalOffset: 0, //for ASL-grammatically correct double letters.
	wordIndex: 0,
	letterIndex: 0,
	word: "",
	usedWords: []
};

var config = {
	maxWordIndex: 0,
	wordLengthLimit: 0,
	speed: SPEEDS[1], //default speed is medium
}

function countAvailableWords(wordlist, maxlength) {
	// returns the number of words with word length <= maxlength
	// assumes wordlist is sorted by length, shortest words first
	var i;
	for (i = 0; i < wordlist.length; i++) {
		if (wordlist[i].length > maxlength) {
			break;
		}
	}
	return Math.max(0, i - 1);
}

function compareWordlength(a, b) {
	return a.length - b.length;
}

function clearUsed() {
	conversation.wordsUsed = [];
	conversation.wordIndex = 0;
}

function showLetterImage(word, letterIndex, id) {
	var letter = " ";
	//Ensure it's an alphabetic character
	if (word.length > 0 && word[letterIndex].match(/[a-z]/i)) {
		// check for double letter
		if (letterIndex > 0 && word[letterIndex] == word[letterIndex - 1]) {
			conversation.horizontalOffset++;
		}
		letter = word[letterIndex];
	}
	document.getElementById(id).style.textAlign = "right";
	document.getElementById(id).style.paddingRight = (5 *
		conversation.horizontalOffset) + "%";
	document.getElementById(id).innerHTML = letter;
}

function updateLetter() {
	if (conversation.playerState == StateEnum.LISTENING) {
		if (conversation.letterIndex < conversation.word.length) {
			showLetterImage(conversation.word, conversation.letterIndex,
				"letterImage");
			conversation.letterIndex++;
			setTimeout(updateLetter, config.speed);
		} else { //Computr is finished signing. Player's turn to sign.
			showLetterImage(" ", 0, "letterImage");
			conversation.playerState = StateEnum.SIGNING;
		}
	}
}

function changeSpeed(speed_arg) {
	config.speed = SPEEDS[speed_arg];
	//playWord();
}

function clearInput() {
	//Reset horizontal offset for word replays.
	conversation.horizontalOffset = 0;
	//Reset playerInputPreview
	showLetterImage(" ", 0, "inputImage");
	//Clear the textbox and focus
	document.getElementById("playerInput").value = "";
	document.getElementById("playerInput").focus();
}

function inputListener() {
	if (conversation.playerState == StateEnum.SIGNING) {
		var input = document.getElementById('playerInput');
		//If The user types texts and then deletes it
		if (input.value == "") {
			clearInput();
		} else {
			showLetterImage(input.value, input.value.length - 1, "inputImage");
		}
	}
	//The user is listening and should not interrupt.
	else {
		clearInput();
	}
}

function addToScore(amount) {
	conversation.score += amount;
	document.getElementById("score").innerHTML = conversation.score + '';
}

function playWord() {
	conversation.playerState = StateEnum.LISTENING;
	conversation.letterIndex = 0;
	clearInput();
	updateLetter();
}

function fineTuneSpeed(fine_speed_arg) {
	var ADJUST_BY = 1.3; //Adjust speed by thirds.
	switch (fine_speed_arg) {
		case FineTuneSpeedEnum.INCREASE:
			config.speed *= ADJUST_BY;
			break;
		case FineTuneSpeedEnum.DECREASE:
			config.speed /= ADJUST_BY
			break;
		case FineTuneSpeedEnum.STEADY:
		default:
			return false;
	}
	return true;
	//playWord();
}

function setWordLengthLimit(length_lim) {
	config.wordLengthLimit = length_lim;
	config.maxWordIndex = countAvailableWords(WORDS, length_lim);
	clearUsed();
	newWord();
}

function checkWord() {
	var inputText = document.getElementById("playerInput").value;
	var isCorrect = inputText.toLowerCase() == conversation.word.toLowerCase();
	if (inputText.length > 0) {
		if (isCorrect) {
			addToScore(+1);
		} else {
			addToScore(-1);
		}
	}
	return isCorrect;
}

function newWord() {
	var randIndex = 0;
	var k;

	//If we used all the words.
	if (conversation.usedWords.length >= config.maxWordIndex) {
		clearUsed();
	}
	//Pick a unique random word from the dictionary under the letter limit.
	do {
		randIndex = Math.floor(Math.random() * config.maxWordIndex + 1);
	} while (conversation.usedWords.includes(randIndex));
	//Take that new word and set it as the current word.
	conversation.usedWords.push(randIndex);
	conversation.word = WORDS[randIndex];
	playWord();
}

function buttonClickListener() {
	if (conversation.playerState == StateEnum.SIGNING) {
		if (checkWord()) {
			newWord();
		} else {
			//Replay so they can try again.
			playWord();
		}
	} else {
		clearInput();
	}
}

function onLoadListener() {
	document.getElementById("playerSubmitAnswer").onclick = buttonClickListener;
	document.getElementById("playerInput").onkeyup = inputListener;
	// sort by word length
	WORDS.sort(compareWordlength);
	setWordLengthLimit(99);
}

window.onload = onLoadListener;
