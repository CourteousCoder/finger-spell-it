'use strict';
var word = "";
var letterIndex = 0;
var wordIndex = 0;
var speed = new Array();
var used_words = new Array();
var score = 0;
// boolean switches to control playback
var newpage = false; // autostart first word (false = don't autostart)
var playing = false;
var iscorrect = false;
var ischecked = false;

// default speed is medium
var speed_val = 1;
var new_speed;
var length_lim = 99;
var all_letters;

function init() {
	speed[0] = 1000; // 1 second
	speed[1] = 666; // 2/3 second
	speed[2] = 333; // 1/3 second
	speed[3] = 200; // 1/5 second
	// default speed is medium
	new_speed = speed[speed_val];
	all_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
	delete used_words;
	used_words = new Array();
	wordIndex = 0;
}
// sort by word length
words.sort(compareWordlength);
var maxWordIndex = count_available(words, length_lim);

function update_letter() {
	if (playing == false) {
		return false;
	}
	if (letterIndex >= word.length) {
		showLetterImage("blank", false;);
		return;
	}
	if (all_letters.indexOf(word.charAt(letterIndex)) >= 0) {
		// check for double letter
		if (word.charAt(letterIndex) == word.charAt(letterIndex - 1)) {
			eval("document.images['ASLalphabet'].src='images/" + word.charAt(letterIndex) +
				word.charAt(
					letterIndex++) + ".gif'");
		} else {
			eval("document.images['ASLalphabet'].src='images/" + word.charAt(letterIndex++) +
				".gif'");
		}
	} else {
		document.images['ASLalphabet'].src = "images/blank.gif";
		letterIndex++;
	}
	setTimeout("update_letter()", new_speed);
}

function change_speed(speed_val_arg) {
	new_speed = speed[speed_val_arg];
	//alert(new_speed);
	change_speed2();
}

function change_speed2() {
	playing = true;
	iscorrect = false;
	ischecked = false;
	letterIndex = 0;
	document.asl_words.input.focus();
	//	window.setTimeout("update_letter()", new_speed);
	update_letter();
}

function set_speed(speed_val_arg) {
	if (speed_val_arg == 0) {
		new_speed = new_speed * 1.3;
	} else
	if (speed_val_arg == 1) {
		new_speed = new_speed / 1.3;
	}
	//alert(new_speed);
	change_speed2();
}

function set_length_lim(length_lim_arg) {
	//alert(length_lim_arg);
	playing = true;
	iscorrect = false;
	ischecked = false;
	letterIndex = 0;
	length_lim = length_lim_arg;
	maxWordIndex = count_available(words, length_lim);
	clear_used()
	document.asl_words.input.focus();
	new_word();
}

function check_word() {
	if (ischecked == true) {
		if (iscorrect == true) {
			new_word();
		} else {
			change_speed2();
		}
		return false;
	}
	ischecked = true;
	if (document.forms[0].input.value == word) {

		//alert("Correct: nice job!");
		iscorrect = true;
		document.images['ASLalphabet'].src = "images/goodjob.png";
		playing = false;
		score = score + 1;
		document.getElementById('scoretxt').innerHTML = score + '';
	} else {
		if (document.forms[0].input.value == "") {
			change_speed2();
		} else {
			//alert("Sorry: try again!");
			document.images['ASLalphabet'].src = "images/tryagain.png";
			playing = false;
			score = score - 1;
			document.getElementById('scoretxt').innerHTML = score + '';

		}
	}
	document.asl_words.input.select();
	return false;
}

function new_word() {
	var isUsed = false;
	var k;
	while (true) {
		var rand = Math.random();
		var randNum = Math.floor(rand * maxWordIndex + 1);
		isUsed = false;
		if (used_words.length >= maxWordIndex) {
			clear_used();
		} else {
			for (k = 0; k < used_words.length; k++) {
				if (randNum == used_words[k]) {
					isUsed = true;
				}
			}
		}
		if (isUsed == false) {
			used_words[wordIndex++] = randNum;
			word = words[randNum];
			document.forms[0].input.value = "";
			document.asl_words.input.focus();
			break;
		}
	}
	if (newpage == true) {
		newpage = false;
		return;
	} else {
		change_speed2();
	}
}
