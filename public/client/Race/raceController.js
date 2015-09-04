angular.module('coderace.race', [])

.controller('RaceController', function ($scope, Race, socket){
  
  $scope.code = "var sum = function(){}"; //set a temp value to put in the text area.

  $scope.evaluate = function(code) {
    $scope.inputs = [4,5];
    $scope.expectedAnswer = 9;
    eval(code);
    //this should move into a the Race factory.
    var response = function(code){ //determine the text response.
      if (typeof sum === "function"){ //a function called sum should now be defined from the text input.
        if (sum(4,5) === 9) {
          return sum(4,5) + " - correct!";
        }
        else {
          return sum(4,5) + " - incorrect!";
        }
      }
      else {
        return "sum should be a function";
      }
    };
    $scope.response = response(code);
  }

  var userId;
  socket.on('userId', function(data){
    userId = data.userId
  });

  $scope.typing = function(code){
    socket.emit('typing', {
      code: code,
      userId: userId
    });
  };

  socket.on('typing', function(data) {
    if (data.userId !== userId) { //if the typing event emitted from the server does not have the same userId as the userId on this client
      $scope.competitorCode = data.code; //populate the competitor text area with the other users code.
    }
  });

});