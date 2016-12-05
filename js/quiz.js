'use strict';
//All these objects used to be many variables.
//I grouped them for code organization.

//Constants for handling delay between letters.
var SpeedConstants = {
	MAX: 1000,
	MIN: 200,
	DEFAULT: 600,
	STEP: 1.1, //Change speed by a factor of 10%
};

//The player can be in only one of these states at a time.
var StateEnum = {
	LISTENING: 0,
	SIGNING: 1
};

var conversation = {
	playerState: StateEnum.SIGNING,
	score: 0,
	doubleLetters: 0, //for ASL-grammatically correct double letters.
	wordIndex: 0,
	letterIndex: 0,
	word: "",
	usedWords: []
};

var config = {
	maxWordIndex: 0,
	wordLengthLimit: 0,
	delay: SpeedConstants.DEFAULT, //default speed is medium
	autospeed: true //Speed automatically changes based on score.
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

function getImageFileName(letter) {
	return "img/" + letter + ".gif";
}

//ASL Grammar says you have to slide your hand to the side when you spell
// a word with double-letters. The word "HELLO" has 1 slide on the 'LL'
function getHorizontalOffset() {
	//Percentage of stage space that isn't covered by curtains.
	var STAGE_SIZE = 60;
	//Describes how far to the side we want to slide.
	var SLIDE_AMOUNT = 5;
	//Slide for each double-letter in the word.
	// "MISSISSIPPI" has 3 slides: "SS", "SS", and "PP"
	var horizontalOffset = SLIDE_AMOUNT * conversation.doubleLetters;
	//Wrap around to the beginning if we slide ourselves offstage.
	return horizontalOffset % STAGE_SIZE;
}

function showLetterImage(word, letterIndex, id) {
	var letter = "_";
	//Ensure it's an alphabetic character
	if (word.length > 0 && word[letterIndex].match(/[a-z]/i)) {
		// check for double letter
		if (letterIndex > 0 && word[letterIndex] == word[letterIndex - 1]) {
			conversation.doubleLetters++;
		}
		letter = word[letterIndex];
	}
	document.getElementById(id + "Stage").style.textAlign = "right";
	document.getElementById(id).style.paddingRight = getHorizontalOffset() + "%";
	document.getElementById(id).src = getImageFileName(letter);
}

function updateLetter() {
	if (conversation.playerState == StateEnum.LISTENING) {
		if (conversation.letterIndex < conversation.word.length) {
			showLetterImage(conversation.word, conversation.letterIndex,
				"letterImage");
			conversation.letterIndex++;
			setTimeout(updateLetter, config.delay);
		} else { //Computr is finished signing. Player's turn to sign.
			showLetterImage("_", 0, "letterImage");
			conversation.playerState = StateEnum.SIGNING;
		}
	}
}


function clearInput() {
	//Reset horizontal offset for word replays.
	conversation.doubleLetters = 0;
	//Reset playerInputPreview
	showLetterImage("_", 0, "inputImage");
	//Clear the textbox and focus
	document.getElementById("playerInput").value = "";
	document.getElementById("playerInput").focus();
}


function addToScore(amount) {
	conversation.score += amount;
	document.getElementById("score").innerHTML = conversation.score + '';
}

function playWord() {
	if (conversation.playerState == StateEnum.SIGNING) {
		conversation.playerState = StateEnum.LISTENING;
		conversation.letterIndex = 0;
		clearInput();
		updateLetter();
	}
}

function setWordLengthLimit(length_lim) {
	config.wordLengthLimit = length_lim;
	config.maxWordIndex = countAvailableWords(WORDS, length_lim);
	clearUsed();
	newWord();
}

function checkWord() {
	var isCorrect = false;
	var inputText = document.getElementById("playerInput").value;
	if (inputText.length > 0) {
		if (inputText.toLowerCase() == conversation.word.toLowerCase()) {
			isCorrect = true;
			addToScore(+1);
			if (config.autospeed) {
				onSpeedIncreaseListener();
			}
		} else {
			addToScore(-1);
			if (config.autospeed) {
				onSpeedDecreaseListener();
			}
		}
	}
	return isCorrect;
}

function newWord() {
	var randIndex = 0;
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

function onSubmitListener() {
	if (checkWord()) {
		newWord();
	} else {
		//Replay so they can try again.
		playWord();
	}
}

function reverseSlider(speed_arg) {
	return SpeedConstants.MAX + SpeedConstants.MIN - speed_arg;
}

function onSpeedChangeListener() {
	var speed = document.getElementById("speedSlider").value;
	//Reverse the direction of the slider to be more intuitive.
	config.delay = reverseSlider(parseInt(speed));
	playWord();
}

function onSpeedIncreaseListener() {
	config.delay /= SpeedConstants.STEP;
	document.getElementById("speedSlider").value = reverseSlider(config.delay);
	playWord();
}

function onSpeedDecreaseListener() {
	config.delay *= SpeedConstants.STEP;
	document.getElementById("speedSlider").value = reverseSlider(config.delay);
	if (conversation.playerState == StateEnum.SIGNING) {
		playWord();
	}
}

function onTextInputListener(event) {
	var ENTER_KEY = 13;
	var input = document.getElementById('playerInput');
	if (conversation.playerState == StateEnum.LISTENING) {
		clearInput(); //Don't interrupt word.
	} else if (event.keyCode == ENTER_KEY) {
		onSubmitListener(); //Player typed something and wants to submit.
	} else if (input.value == "") { //If player types texts and then deletes it
		clearInput();
	} else {
		showLetterImage(input.value, input.value.length - 1, "inputImage");
	}
}

function toggleAutoSpeedListener() {
	config.autospeed = document.getElementById("autospeed").checked;
}

function onLoadListener() {
	document.getElementById("playerInput").addEventListener("keyup",
		onTextInputListener);
	document.getElementById("autospeed").onchange = toggleAutoSpeedListener;
	document.getElementById("playerSubmitAnswer").onclick = onSubmitListener;
	document.getElementById("faster").onclick = onSpeedIncreaseListener;
	document.getElementById("slower").onclick = onSpeedDecreaseListener;
	var slider = document.getElementById("speedSlider");
	slider.max = SpeedConstants.MAX;
	slider.min = SpeedConstants.MIN;
	slider.value = SpeedConstants.DEFAULT;
	slider.onchange = onSpeedChangeListener;
	// sort by word length
	WORDS.sort(compareWordlength);
	setWordLengthLimit(99);
}

window.onload = onLoadListener;
