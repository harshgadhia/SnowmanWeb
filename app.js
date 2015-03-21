var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var fs = require("fs");
var filepath = path.join(__dirname + '/data/', 'words.txt');

// Game variables are global
var gameWord = "";
var gameWordLength = "";
var gameWordArr = [];
var guessedWordArr = [];
var allowedAttempts = 5;
var wrongCounter = 0;
var playFurther = true;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
require('./routes/client')(app);

server.listen(80, function(){
	console.log('server is listening on port http://localhost:80');
});

io.on('connection', function (socket) {
  console.log("A user connected");

 socket.on('start game', function (data) {
    initialize();
    fs.readFile(filepath, {encoding:'utf8'}, function (err, data) {
      
      var words = data.split('\r\n');
      gameWord = words[Math.floor(Math.random() * words.length)];
      gameWordArr = gameWord.split("");
      gameWordLength = gameWordArr.length;
      
      console.log('Word from server is ' + gameWord);

      for(var i=0; i<gameWord.length; i++)
        guessedWordArr[i] = "*";
      
      socket.emit('gameword',
      	{ gameWordLength:gameWordLength,
      	  guessedWordArr: guessedWordArr,
      	  playFurther:playFurther, 
      	  triesLeft: getTriesLeft()
      	});
    });
  });

  // 
  socket.on('guessWord', function (data) {
    
    var check = isAlphabetPresent(data.letter);
    console.log("user guessed " + data.letter );
    
    // Sending the actual word only if user wins/loses
    if(guessedWordArr.indexOf("*") < 0 || getTriesLeft() == 0) {
    	socket.emit('gameword',
    	{ check: check,
    	  gameWord:gameWord,
    	  guessedWordArr:guessedWordArr,
    	  playFurther:playFurther,
    	  triesLeft:getTriesLeft()
    	});
    }
    else { // send only the length of word while the user plays
    	socket.emit('gameword',
    	{ check: check,
    	  gameWordLength:gameWordLength,
    	  guessedWordArr:guessedWordArr,
    	  playFurther:playFurther,
    	  triesLeft:getTriesLeft()
    	});
    }

    
  });

socket.on('disconnect', function() {
	console.log("A user disconnected...");
});

function initialize() {
   gameWord = "";
   gameWordArr = [];
   guessedWordArr = [];
   allowedAttempts = 5;
   wrongCounter = 0;
   playFurther = true;
}

function isAlphabetPresent(guessedAlphabet) {

  var found = false;
  
  // Constructing the word to display to user.
  for(var i=0; i<gameWord.length; i++) {
    if(gameWord[i] == guessedAlphabet) {
      guessedWordArr[i] = guessedAlphabet.toUpperCase();
      found = true;
    }
  }
  
  // If wrong letter guessed, incrementing the counter
  if(!found) {
    wrongCounter++;
  }
  
  // If Maximum wrong are attempts reached
  if(wrongCounter >= allowedAttempts) {
    playFurther = false;
  }
  return found;
}

function getTriesLeft() {
  if(wrongCounter <= allowedAttempts) {
    return allowedAttempts - wrongCounter;
  }
  return 0;
}

});