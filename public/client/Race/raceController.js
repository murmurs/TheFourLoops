angular.module('coderace.race', ['ui.codemirror'])

.controller('raceController', function ($scope, $rootScope, Race, socket){
  var master = false;
  $scope.room = false; // need to revert to false. only done for testing --- tito
  $scope.opponentLeft = false;
  $scope.opponentPassed = false;

  var getCookies = function(){
    var pairs = document.cookie.split(";");
    var cookies = {};
    for (var i=0; i<pairs.length; i++){
      pairs
      var pair = pairs[i].trim().split("=");
      cookies[pair[0]] = unescape(pair[1]);
    }
    return cookies;
  }

  var cookies = getCookies();
  var facebookId = document.facebookId = cookies.userID;
  var facebookDisplayName = document.facebookDisplayName = cookies.displayName;
  var startTime;
  var challengeId;

  // countdown timer
  function timer(){
    socket.emit('startAnimate');
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
        startTime = Date.now();
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

    var matchId = $scope.room

    var storeMatchResults = function(){
      Race.dataRef.child('Matches/' + matchId).update({
        winnerId: facebookId,
        endTime: Date.now(),
      })
    }

    var storeGhost = function(){
      var matchRef = Race.dataRef.child('Matches/' + matchId);
      var matchesRef = matchRef.parent();

      matchRef.once('value', function(snapshot){
        var matchObj = snapshot.val();

        var winnerId = matchObj.winnerId;
        var winnerTypingDataRef = matchRef.child('players/' + winnerId);
        winnerTypingDataRef.once('value', function(snapshot){
          var ghostData = snapshot.val();
          var ghostsRef = Race.dataRef.child('Challenges/' + challengeId + '/Ghosts');
          var ghostIdRef = ghostsRef.push();
          ghostIdRef.set({
            typingData: ghostData,
            gameDuration: matchObj.endTime - matchObj.startTime,
          });
        })
      })
    }

    //render the results from the worker in the dom.
    var renderCodeResponse = function(codeResponse) {
      $scope.dataLoaded = true; //set this to true to stop the spinner.
      $scope.validResponse = codeResponse.valid;
      $scope.error = codeResponse.error;
      $scope.tests = codeResponse.tests;
      $scope.passed = codeResponse.passed;
      $scope.responseText = codeResponse.passed ? "correct!" : "incorrect";
      if(codeResponse.passed){
        storeMatchResults();
        storeGhost();
      }

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
      code: code,
      facebookId: facebookId,
      startTime: startTime,
      challengeId: challengeId,
    });
  };

  $scope.$on('$destroy', function(){
    socket.disconnect();
  });

  if(!socket.connected){
    socket.connect();
  }

  socket.emit('start', {
    username: facebookDisplayName.split(' ')[0],
  });
  
  socket.on('opponentLeft', function(){
    $scope.opponentLeft = true;
  });
  socket.on('typing', function(data) {
    $scope.competitorCode = data.code; 
  })
  socket.on('roomJoined', function(matchData){
    $scope.room = matchData.matchId;
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
      var challengesObject;
      Race.dataRef.child('Challenges').on('value', function(snapshot){
        challengesObject = snapshot.val();
      });

      challengeIdsArray = Object.keys(challengesObject);
      var randomIndex = getRandomArbitrary(0, challengeIdsArray.length);

      Race.getData(challengeIdsArray[randomIndex], function(problem){
        challengeId = challengeIdsArray[randomIndex];
        problem.challengeId = challengeId
        socket.emit('problem', problem);
      });
    });
  });
  socket.on('problem', function(problem){
    challengeId = problem.challengeId;
    setTimeout(function(){
      Race.setProblem(problem);
    }, 0, problem);
  });
  
  //Everything below here is for the animation
  var stance = {
    'kakashi' : ['stance/Position1.png', 'stance/Position2.png', 'stance/Position3.png', 'stance/Position4.png', 'stance/Position5.png',  'stance/Position6.png'],
    'naruto' : ['stance/Position1.png', 'stance/Position2.png', 'stance/Position3.png', 'stance/Position4.png', 'stance/Position5.png', 'stance/Position6.png']
  }
  
  var attack = {
    'kakashi' : ['attacks/attack1/Position1.png', 'attacks/attack1/Position2.png', 'attacks/attack1/Position3.png', 'attacks/attack1/Position4.png', 'attacks/attack1/Position5.png', 'attacks/attack1/Position6.png', 'attacks/attack1/Position7.png', 'attacks/attack1/Position8.png', 'attacks/attack1/Position9.png', 'attacks/attack1/Position10.png', 'attacks/attack1/Position11.png', 'attacks/attack1/Position12.png', 'attacks/attack1/Position13.png'],
    'naruto' : ['attacks/attack1/Position1.png', 'attacks/attack1/Position2.png', 'attacks/attack1/Position3.png', 'attacks/attack1/Position4.png', 'attacks/attack1/Position5.png', 'attacks/attack1/Position6.png', 'attacks/attack1/Position7.png', 'attacks/attack1/Position8.png', 'attacks/attack1/Position9.png', 'attacks/attack1/Position10.png', 'attacks/attack1/Position11.png']
  }
  
  var img = document.getElementsByTagName('IMG');
  var index = 0;
  var index2 = 0;
  var attacking = false;
  var running = false;
  var avatarPath = "img/kakashi/";
  var avatarPath2 = "img/naruto/"
  
  var thread, thread2;
  
  socket.on('animate', function(data){
    var elem = img[2];
    var elem2 = img[3];
    
    function stanceImg(avatar){
      if (avatar === 'kakashi') index++;
      else if (avatar === 'naruto') index2++;
      
      if (avatar === 'kakashi' && index >= stance.kakashi.length) index = 0;
      else if (avatar === 'naruto' && index2 >= stance.naruto.length) index2 = 0;
      
      if (avatar === 'kakashi') elem.src = avatarPath + stance.kakashi[index];
      else if (avatar === 'naruto') elem2.src = avatarPath2 + stance.naruto[index2];
    }
      
    function attackImg(avatar){
      if (avatar === 'kakashi') index++;
      else if (avatar === 'naruto') index2++;

      if (avatar === 'kakashi') {
        if (index >= attack.kakashi.length) {
          switchImg(stanceImg.bind(null, 'kakashi'), 100, avatar)
        }
        else elem.src = avatarPath + attack.kakashi[index];
      }
      else if (avatar === 'naruto') {
        if (index2 >= attack.naruto.length) {
          switchImg(function(){ stanceImg('naruto') }, 100, avatar);
        }
        else elem2.src = avatarPath2 + attack.naruto[index];
      }
    }
      
    function switchImg(img, duration, avatar, attacking, running){
      duration = duration || 100;
      index = 0;
      attacking = attacking || false;
      running = running || false;
      if (avatar === 'kakashi') { 
        clearInterval(thread); //For clearing a setInterval
        thread = setInterval(img, duration);
      }
      else if (avatar === 'naruto') {
        clearInterval(thread2);
        thread2 = setInterval(img, duration);
      }
    }
 
    switchImg(stanceImg.bind(null, data['character1']), 100, data['character1']);
    switchImg(attackImg.bind(null, data['character2']), 100, data['character2']);
    
    //to call the attack function just use this:
    //attackImg(avatarName);
  })
});


