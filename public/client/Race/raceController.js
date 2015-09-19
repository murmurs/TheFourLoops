angular.module('coderace.race', ['ui.codemirror'])

.controller('raceController', function ($scope, $rootScope, Race, socket){
  var master = false;
  $scope.room = false; // need to revert to false. only done for testing --- tito
  $scope.opponentLeft = false;
  $scope.opponentPassed = false;
  $scope.username = Race.username;
  
  // countdown timer
  function timer(){
    $scope.counter = 5;
    $scope.countComplete = true;
    var countDown = setInterval(function() {
    $scope.counter--;
      $scope.$apply();
      if($scope.counter === 0){
        clearInterval(countDown);
        $scope.countComplete = false;
        $('#waitingOverlay').css('display', 'none');
        codeMirror();
      }
    }, 1000);
  }

  function codeMirror(){
    // codemirror options
    $scope.editorOptions = {
      mode: 'javascript',
      theme: '3024-night',
      lineNumbers: true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      autofocus: false,
      keyMap: 'sublime',
      autoCloseBrackets: true,
      tabSize: 2,
      extraKeys: {"Ctrl-Space": "autocomplete"},
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      scrollbarStyle: "null"
    };
    // codemirror autocomplete
    function autocomplete(){
      CodeMirror.showHint({hint: CodeMirror.hint.anyword});
    }
    $scope.$apply();
  }

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }//generate a random number


//challengeInputs is set the in the outer scope so it can be used in $scope.evaluate.
  var challengeInputs;

  //when the data is loaded in the factory, load the data in the html and set the challenge inputs.
  $scope.$on('Race:ready', function (event, data) {
    $scope.code = data.startingCode;
    $scope.question = data.question; 
    $scope.functionName = data.functionName;
    $scope.$apply(); //push the newly acquired data to the dom.

    //set challenge inputs to be used later by the worker.
    challengeInputs = {
      inputs: data.inputs,
      answers: data.answers,
      functionName: data.functionName
    };
  });

  $scope.evaluate = function(code) {

    //When the user firsts click the submit button, set all values to their defaults, in case they are submitting on a second or third try, the wrong test results wont show up.
    $scope.dataLoaded = false;
    $scope.error = undefined;
    $scope.tests = undefined;
    $scope.passed = undefined;
    $scope.responseText = undefined;

    //render the results from the worker in the dom.
    var renderCodeResponse = function(codeResponse) {
      $scope.dataLoaded = true; //set this to true to stop the spinner.
      $scope.validResponse = codeResponse.valid;
      $scope.error = codeResponse.error;
      $scope.tests = codeResponse.tests;
      $scope.passed = codeResponse.passed;
      $scope.responseText = codeResponse.passed ? "correct!" : "incorrect";
      $scope.$apply(); //apply the scope to the dom once the worker has responded with results.
    };

  
    //Execute the worker on the client side 
    if (window.Worker) { //verify that the browser has worker capability.
      var evalWorker = new Worker("client/evalWorker.js");

      angular.extend(challengeInputs, {code: code}); //use the extend function add the input code string to the challenge inputs.

      //launch the worker with the challenge inputs.
      evalWorker.postMessage(challengeInputs);

      //used to test for timeouts 5 seconds after the worker starts.
      var workerComplete = false;

      //if the code input by the user is invalid, this worker will trigger.
      evalWorker.onerror = function(error) {
        console.log(error);
        evalWorker.terminate(); //kill the worker.
        workerComplete = true; //the worker is done.
        var codeResponse = { //the code is invalid. create response to send to the dom.
          valid: false,
          error: error.message,
          passed: false
        };
        renderCodeResponse(codeResponse); //render the dom with the correct code response.
      };

      evalWorker.onmessage = function(codeResponse) { //when the worker sends back its response, update the dom.
        if(codeResponse.data.passed === true){ //tell the opponent that this users code passed.
          socket.emit('passed');
        }
        workerComplete = true; //don't execute the timeout function.
        renderCodeResponse(codeResponse.data); //pass the codeResponse object to the dom to be rendered.
      }
      
      //check for worker timeout.
      setTimeout(function() {
        if (workerComplete === false){ //the worker has not completed after 5 seconds.
          evalWorker.terminate(); //terminate the worker.
          renderCodeResponse({
            valid: false,
            error: "Code is taking longer than 5 seconds to process",
            passed: false
          });
        }
      }, 5000);
    }
  }

  $scope.typing = function(code){
    socket.emit('typing', {
      code: code
    });
  };

  $scope.$on('$destroy', function(){
    socket.disconnect();
  });

  if(!socket.connected){
    socket.connect();
  }

  socket.emit('start', {
    username:Race.username
  });
  
  socket.on('opponentLeft', function(){
    $scope.opponentLeft = true;
  });
  socket.on('typing', function(data) {
    $scope.competitorCode = data.code; 
  })
  socket.on('roomJoined', function(matchData){
    $scope.room = matchData.room;
    timer();
    $scope.opponent = master ? 
      matchData.player2: matchData.player1;
  });
  socket.on('passed', function(){
    $scope.opponentPassed = true;
  });
  socket.on('master', function(){
    master = true;
    Race.getLength();
    $scope.$on('GotLength', function(event,data){
      var random = getRandomArbitrary(0, data);
      Race.getData(random, function(problem){
        socket.emit('problem', problem);
      });
    });
  });
  socket.on('problem', function(problem){
    setTimeout(function(){
      Race.setProblem(problem);
    }, 0, problem);
  });
});


