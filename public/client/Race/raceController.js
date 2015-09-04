
angular.module('coderace.race', [])

.controller('sumController', function ($scope, Race, socket){
  
  $scope.code = "var sum = function(){}"; //set a temp value to put in the text area.

  $scope.question = Race.question[0];

  $scope.evaluate = function(code) {
    $scope.inputs = Race.input[0];
    $scope.expectedAnswer = Race.answer[0];
    eval(code);
    //this should move into a the Race factory.
    var fn;
    var response = function(code){ //determine the text response.
      if (typeof sum === "function"){ //a function called sum should now be defined from the text input.
        if (sum($scope.inputs) === $scope.expectedAnswer) {
          return sum($scope.inputs) + " - correct!";
        }
        else {
          return sum($scope.inputs) + " - incorrect!";
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