
angular.module('coderace.race', [])

.controller('raceController', function ($scope, Race, socket){
  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }//generate a random number

  var random = getRandomArbitrary(0, Race.question.length);//random is between 0 and the number of questions
  
  $scope.code = Race.start[random]; //set a temp value to put in the text area. This needs to be abstracted.

  $scope.question = Race.question[random];

  $scope.evaluate = function(code) {

    //these will be pulled from the Race factory.
    var challengeInputs = {
      inputs: Race.input[random],
      output: Race.output[random],
      functionName: Race.name[random],
      code: code
    };//the challenge is randomly generated

    //the worker will not be able to access the factory directly.
    //data must be passed to the worker.
    if (window.Worker) { //verify that the browser has worker capability.
      var evalWorker = new Worker("client/evalWorker.js");
      evalWorker.postMessage(challengeInputs);
      evalWorker.onmessage = function(e) { //when the worker sends back its response, update the scope.
        $scope.inputs = e.data.inputs;
        $scope.response = e.data.response;
        $scope.answer = e.data.answer;
        $scope.$apply(); //apply the new scope var to the view.
      }
    }
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