'use strict';
var SPEEDS = [ //in milliseconds
	1000, //slow
	666, //medium
	333, //fast
	200 //Deaf
];

var StateEnum = {
	LISTENING: 0,
	SIGNING: 1
};

var conversation = {
	playerState: StateEnum.Listening,
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
	speed: 1, //default speed is medium
}

function count_available(wordlist, maxlength) {
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

function clear_used() {
	conversation.wordsUsed = [];
	conversation.wordIndex = 0;
}

function showLetterImage(word, letterIndex, id) {
	var letter = " ";
	//Ensure it's an alphabetic character
	if (conversation.word.length > 0 &&
		conversation.word[conversation.letterIndex].match(/[a-z]/i)) {
		// check for double letter
		if (conversation.letterIndex > 0 &&
			conversation.word[conversation.letterIndex] ==
			conversation.word[conversation.letterIndex - 1]) {
			conversation.horizontalOffset++;
		}
		letter = conversation.word[conversation.letterIndex];
	}
	document.getElementById(id).style.textAlign = "right";
	document.getElementById(id).style.paddingRight = (5 *
		conversation.horizontalOffset) + "%";
	document.getElementById(id).innerHTML = letter;
}

function update_letter() {
	if (conversation.playerState == StateEnum.LISTENING) {
		if (conversation.letterIndex < conversation.word.length) {
			showLetterImage(conversation.word, conversation.letterIndex,
				"debugLetterImage");
			conversation.letterIndex++;
			setTimeout(update_letter, config.speed);
		} else { //Computr is finished signing. Player's turn to sign.
			showLetterImage(" ", 0, "debugLetterImage");
			conversation.playerState = StateEnum.SIGNING;
		}
	}
}

function change_speed(speed_val) {
	config.speed = SPEEDS[speed_val];
	playWord();
}

function clearInput() {
	document.getElementById("playerInput").value = "";
	document.getElementById("playerInput").focus();
}

function inputListener() {
	var inputText = document.getElementById('playerInput').value;
	showLetterImage(inputText, inputText.length - 1, "debugInputImage");
}

function updateScore(score_arg) {
	document.getElementById("score").innerHTML = score_arg + '';
}

function playWord() {
	conversation.state = StateEnum.LISTENING;
	conversation.letterIndex = 0;
	clearInput();
	update_letter();
}

function fine_tune_speed(speed_val_arg) {
	if (speed_val_arg == 0) {
		config.speed *= 1.3;
	} else if (speed_val_arg == 1) {
		config.speed /= 1.3;
	}
	playWord();
}

function set_length_lim(length_lim) {
	config.wordLengthLimit = length_lim;
	config.maxWordIndex = count_available(words, length_lim);
	clear_used()
	new_word();
}

function checkWord() {

	var inputText = document.getElementById("playerInput").value;
	if (inputText == "") {
		playWord();
	} else if (inputText.toLowerCase() == word.toLowerCase()) {
		conversation.playWord = StateEnum.LISTENING;
		return true;
		updateScore(++score);
	} else {
		updateScore(--score);
	}
	return false;
}

function new_word() {
	var randIndex = 0;
	var k;
	//If the previous word had a double letter, the offset would persist.
	//To fix, set it to zero.
	conversation.horizontalOffset = 0;
	//If we used all the words.
	if (conversation.usedWords.length >= config.maxWordIndex) {
		clear_used();
	}
	//Pick a unique random word from the dictionary under the letter limit.
	do {
		randIndex = Math.floor(Math.random() * config.maxWordIndex + 1);
	} while (conversation.usedWords.includes(randIndex));
	//Take that new word and set it as the current word.
	conversation.usedWords.push(randIndex);
	conversation.word = words[randIndex];
	playWord();
}

function buttonClickListener() {
	//Reset horizontal offset for word replays.
	conversation.horizontalOffset = 0;
	if (checkWord()) {
		new_word();
	}
	//Clear input-text box.
	document.getElementById("playerInput").value = "";
	//Clear input-preview box.
	var inputText = document.getElementById('playerInput').value;
	showLetterImage(inputText, " ", "debugInputImage");
}

function onLoadListener() {
	// sort by word length
	words.sort(compareWordlength);
	maxWordIndex = count_available(words, config.wordLengthLimit);
	document.getElementById("playerSubmitAnswer").onclick = buttonClickListener;
	document.getElementById("playerInput").onkeyup = inputListener;
	clear_used();
	new_word();
}

window.onload = onLoadListener;
