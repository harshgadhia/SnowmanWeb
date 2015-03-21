var app = angular.module('snowmanApp', ['ngResource','btford.socket-io']);

app.factory('resources', function( $resource, $location ) {
  var factory = {};
  factory.routes = {};
  return factory;
});

app.factory('socket', function (socketFactory) {
    return socketFactory();
  })

app.controller('snowmanController', function($scope, socket) {
	
	$scope.loading = false;
	$scope.loadingComplete = false;

	$scope.initialize = function () {
		// Initialize the app variables to use in page
		$scope.guessedWordArr = [];
		$scope.playFurther = true;
		$scope.present = true;
		$scope.LostGame = false;
		$scope.winGame = false;
		$scope.loading = true;
	}

	$scope.startGame = function () {
		socket.emit('start game');
		socket.on('gameword', function (response) {
			// Initially blank array is received from server.
			$scope.initialize();
			$scope.guessedWordArr = response.guessedWordArr;
			
			// Hide the preloader on getting the response from server.
			$scope.loading = false;
			$scope.loadingComplete = true;			
		});	
	}

	$scope.checkLetter = function(letter) {

		// sending the letter to server
		socket.emit('guessWord', {letter:letter});

		// receive the response from server
		socket.on('gameword', function(response) {
			
			$scope.playFurther = response.playFurther;
			$scope.triesLeft = response.triesLeft;
			$scope.present = response.check;
			
			if($scope.guessedWordArr.indexOf("*") < 0)
				$scope.winGame = true;
			
			if($scope.triesLeft==0) {
			 	$scope.correctWord = response.gameWord;
			 	$scope.playFurther = false;
			 	$scope.LostGame = true;
			}
			if($scope.winGame == true) {
				$scope.correctWord = response.gameWord;
			}
			
		});
	};
});