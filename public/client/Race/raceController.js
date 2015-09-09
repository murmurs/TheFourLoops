
angular.module('coderace.race', ['ui.codemirror'])

.controller('raceController', function ($scope, $rootScope, Race, socket){
  var master = false;
  $scope.room = false;
  $scope.lonelySockets = false;
  // codemirror options
  
  $scope.editorOptions = {
      lineWrapping : true,
      lineNumbers: true,
      theme: 'cobalt',
      mode: 'javascript',
      keymap: 'sublime',
      autofocus: true
  };

  var textArea = document.getElementById('opponentEditor');

  // var myCodeMirror = CodeMirror.fromTextArea(textArea);
  // codemirror opponent editor
  // var editor = new CodeMirror(CodeMirror.replace("#opponentEditor"), {
  //   parserfile: ["http://codemirror.net/1/js/tokenizejavascript.js", 
  //   "http://codemirror.net/1/js/parsejavascript.js"],
  //   path: "../codemirror/",
  //   stylesheet: "../../css/jscolors.css",
  //   content: document.getElementById("opponentEditor").value
  // });

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }//generate a random number

  var random = getRandomArbitrary(0, 2);//random is between 0 and the number of questions
  // $scope.code = Race.start[random]; //set a temp value to put in the text area. This needs to be abstracted.
  // $scope.question = Race.question[random];

  var challengeInputs;

  $scope.dataLoaded = false;

  $scope.$on('Race:ready', function (event, data) {
    console.log("race ready!"); // expected to be raceReady!
    console.log(data);
    $scope.code = data.startingCode;
    $scope.question = data.question;
    $scope.$apply();
    
    challengeInputs = {
      inputs: data.inputs,
      answers: data.answers,
      functionName: data.functionName
    };
  });

  $scope.evaluate = function(code) {

    console.log("Code!", code);

    console.log("evaluating");

    var renderCodeResponse = function(codeResponse) {
      $scope.dataLoaded = true; //set this to true to stop the spinner.
      
      $scope.validResponse = codeResponse.valid;
      $scope.tests = codeResponse.tests;
      $scope.passed = codeResponse.passed;
      $scope.$apply();
    };
  
    //the worker will not be able to access the factory directly.
    if (window.Worker) { //verify that the browser has worker capability.
      var evalWorker = new Worker("client/evalWorker.js");

      angular.extend(challengeInputs, {code: code}); //add the code to the challenge inputs.

      evalWorker.postMessage(challengeInputs);

      var workerComplete = false;

      //if the input from the form is invalid, this worker will trigger.
      evalWorker.onerror = function(error) {
        evalWorker.terminate();
        workerComplete = true;
        var codeResponse = {
          valid: false,
          error: error.message
        };
        renderCodeResponse(codeResponse);
        console.log("worker errored!!", error);
      };

      evalWorker.onmessage = function(codeResponse) { //when the worker sends back its response, update the scope.
        workerComplete = true; //don't execute the timeout function.
        console.log("codeResponse in on", codeResponse.data);
        renderCodeResponse(codeResponse.data);
      }
      
      //check for worker timeout.
      setTimeout(function() {
        if (workerComplete === false){ //the worker has not completed after 5 seconds.
          console.log("taking longer than 5 seconds");
          evalWorker.terminate(); //terminate the worker.
          renderCodeResponse({
            valid: false,
            error: "Code is taking longer than 5 seconds to process"
          });
          //create a response for the timeout issues;
        }
      }, 5000);
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
    $scope.competitorCode = data.code; 
  });

  socket.on('roomJoined', function(room){
    $scope.room = room;
  });

  socket.on('master', function(){
    master = true;
    Race.getData(random, function(problem){
      socket.emit('problem', problem);
    });
  });

  socket.on('lonelySockets', function(){
    $scope.lonelySockets = true;
  });

  socket.on('problem', function(problem){
    setTimeout(function(){
      Race.setProblem(problem);
    }, 0, problem);
  });
});

