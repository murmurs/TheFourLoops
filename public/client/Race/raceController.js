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
    //Call them like these at the start.
    socket.emit('startAnimate', { avatar : 'kakashi', animation: 'stance' });
    socket.emit('startAnimate', { avatar : 'naruto', animation: 'stance' });

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
        var matchId = $scope.room
        var matchRef = Race.dataRef.child('Matches/' + matchId);
        matchRef.update({'startTime': startTime});
        matchRef.update({'challengeId': challengeId});
        socket.emit('ghostMatchBegin')
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
        socket.emit('knockOut', {facebookId: facebookId});
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

  if(true){
    socket.emit('start', {
      username: facebookDisplayName.split(' ')[0],
      gameType: 'ghostMatch',
    })
  } else if(false){
    socket.emit('start', {
      username: facebookDisplayName.split(' ')[0],
      gameType: 'randomPlayerVsPlayer'
    });
  }

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
  
  var specialAttack = {
    'kakashi' : ['specials/special1/Position1.png', 'specials/special1/Position2.png', 'specials/special1/Position3.png', 'specials/special1/Position4.png', 'specials/special1/Position5.png', 'specials/special1/Position6.png', 'specials/special1/Position7.png', 'specials/special1/Position8.png', 'specials/special1/Position9.png', 'specials/special1/Position10.png', 'specials/special1/Position11.png', 'specials/special1/Position12.png', 'specials/special1/Position13.png', 'specials/special1/Position14.png', 'specials/special1/Position15.png', 'specials/special1/Position16.png', 'specials/special1/Position17.png', 'specials/special1/Position18.png', 'specials/special1/Position19.png', 'specials/special1/Position20.png', 'specials/special1/Position21.png', 'specials/special1/Position22.png', 'specials/special1/Position23.png', 'specials/special1/Position24.png', 'specials/special1/Position25.png', 'specials/special1/Position26.png'],
    'naruto' : ['specials/special1/Position1.png', 'specials/special1/Position2.png', 'specials/special1/Position3.png', 'specials/special1/Position4.png', 'specials/special1/Position5.png', 'specials/special1/Position6.png', 'specials/special1/Position7.png', 'specials/special1/Position8.png', 'specials/special1/Position9.png', 'specials/special1/Position10.png', 'specials/special1/Position11.png', 'specials/special1/Position12.png', 'specials/special1/Position13.png', 'specials/special1/Position14.png', 'specials/special1/Position15.png', 'specials/special1/Position16.png', 'specials/special1/Position17.png', 'specials/special1/Position18.png', 'specials/special1/Position19.png', 'specials/special1/Position20.png', 'specials/special1/Position21.png', 'specials/special1/Position22.png', 'specials/special1/Position23.png']
  }
  
  var defeat = {
    kakashi : ['defeat/Position1.png', 'defeat/Position2.png', 'defeat/Position3.png', 'defeat/Position4.png', 'defeat/Position5.png'],
    naruto : ['defeat/Position1.png', 'defeat/Position2.png', 'defeat/Position3.png', 'defeat/Position4.png', 'defeat/Position5.png', 'defeat/Position6.png', 'defeat/Position7.png']
  }
  
  var specialWin = {
    naruto : ['specials/special2/specialMove1.png', 'specials/special2/specialMove2.png', 'specials/special2/specialMove3.png', 'specials/special2/specialMove4.png', 'specials/special2/specialMove5.png', 'specials/special2/specialMove6.png', 'specials/special2/specialMove7.png', 'specials/special2/specialMove8.png', 'specials/special2/specialMove9.png', 'specials/special2/specialMove10.png', 'specials/special2/specialMove11.png', 'specials/special2/specialMove12.png', 'specials/special2/specialMove13.png', 'specials/special2/specialMove14.png', 'specials/special2/specialMove15.png', 'specials/special2/specialMove16.png', 'specials/special2/specialMove17.png', 'specials/special2/specialMove18.png', 'specials/special2/specialMove19.png', 'specials/special2/specialMove20.png', 'specials/special2/specialMove21.png', 'specials/special2/specialMove22.png', 'specials/special2/specialMove23.png', 'specials/special2/specialMove24.png', 'specials/special2/specialMove25.png', 'specials/special2/specialMove26.png', 'specials/special2/specialMove27.png', 'specials/special2/specialMove28.png', 'specials/special2/specialMove29.png', 'specials/special2/specialMove30.png', 'specials/special2/specialMove31.png', 'specials/special2/specialMove32.png', 'specials/special2/specialMove33.png', 'specials/special2/specialMove34.png', 'specials/special2/specialMove35.png', 'specials/special2/specialMove36.png', 'specials/special2/specialMove37.png', 'specials/special2/specialMove38.png', 'specials/special2/specialMove39.png', 'specials/special2/specialMove40.png', 'specials/special2/specialMove41.png', 'specials/special2/specialMove42.png', 'specials/special2/specialMove43.png', 'specials/special2/specialMove44.png', 'specials/special2/specialMove45.png', 'specials/special2/specialMove46.png', 'specials/special2/specialMove47.png', 'specials/special2/specialMove48.png', 'specials/special2/specialMove49.png', 'specials/special2/specialMove50.png', 'specials/special2/specialMove51.png', 'specials/special2/specialMove52.png', 'specials/special2/specialMove53.png', 'specials/special2/specialMove54.png', 'specials/special2/specialMove55.png']
  }
  
  var img = document.getElementsByTagName('IMG');
  var index = 0;
  var index2 = 0;
  var left = -50, left2 = -30;
  var attacking = false, attacking2 = false;
  var dead = false, dead2 = false;
  var running = false;
  var avatarPath = "img/kakashi/";
  var avatarPath2 = "img/naruto/"
  var done = false;

  var thread, thread2;

  socket.on('animate', function(data){
    
    if(data.moveType === 'normalAttack'){
      if(data.facebookId === facebookId){
        data.action = ['attack', 'naruto'];
      } else{
        data.action = ['attack', 'kakashi'];
      }
    }
    else if(data.moveType === 'knockOut'){
      if(data.facebookId === facebookId){
        attacking2 = false;
        dead = true;
        switchImg('stance', 'naruto');
        switchImg('stance', 'kakashi');
        data.action = ['specialWin', 'naruto'];
      } else{
        attacking = false;
        dead2 = true;
        switchImg('stance', 'kakashi');
        switchImg('stance', 'naruto');
        data.action = ['specialAttack', 'kakashi'];
        
      }
    }

    var elem = img[2];
    var elem2 = img[3];

    ////////////////////////STANCE////////////////////////////////////////
    function kakashiStanceImg(){
      index++;
      
      if (index >= stance.kakashi.length) index = 0;  
      
      elem.style.left = '-50px';
      elem.src = avatarPath + stance.kakashi[index];
    }

    function narutoStanceImg(){
      index2++;

      if (index2 >= stance.naruto.length) index2 = 0;
      
      elem2.style.width = '150%';
      elem2.style.left = '-30px';
      elem2.src = avatarPath2 + stance.naruto[index2];
    }
      
    ////////////////////////ATTACK//////////////////////////////////////// 
    function kakashiAttackImg(){
      index++;

      if (index >= attack.kakashi.length) {
        attacking = false;
        switchImg('stance', 'kakashi')
      }
      else elem.src = avatarPath + attack.kakashi[index];
    }

    function narutoAttackImg(){
      index2++;
      
      if (index2 >= attack.naruto.length) {
        attacking2 = false;
        switchImg('stance', 'naruto');
      }
      else elem2.src = avatarPath2 + attack.naruto[index2];
    }
    
    ///////////////////Special Attack//////////////////////
    function kakashiSpecialAttackImg(){
      index++;
      
      if (index >= 12 && index <= 13) left += 220;
      elem.style.left = left + "px";
      
      if (index >= specialAttack.kakashi.length) {
        attacking = false;
        switchImg('stance', 'kakashi');
        left = -50;
      }
      else elem.src = avatarPath + specialAttack.kakashi[index];
    }
    
    function narutoSpecialAttackImg(){
      index2++;
    
      if (index2 >= 1 && index2 <= 6) left2 -= 80;
      if (index2 === 20) left2 = -30;
      elem2.style.left = left2 + "px";
      
      if (index2 >= specialAttack.naruto.length) {
        attacking2 = false;
        switchImg('stance', 'naruto');
      }
      else elem2.src = avatarPath2 + specialAttack.naruto[index2];
    }
    
    ///////////////////////Defeat//////////////////////
    function kakashiDefeatImg(){
      index++;
      
      if (index >= defeat.kakashi.length) index--;
      elem.src = avatarPath + defeat.kakashi[index];
    }
    
    function narutoDefeatImg(){
      index2++;
      
      if (index2 >= defeat.naruto.length) index2 = 5;
      elem2.src = avatarPath2 + defeat.naruto[index2];
    }
    
    ///////////////////////////////////WinningMove////////////////////////////////////
    function narutoSpecialWinImg(){
        index2++;
        if (index2 === 0) left2 = -150;
        elem2.style.width = '210%';
        if (index2 >= 8 && index2 <= 12) left2 -= 80;
        if (index2 >= 42) {
          elem2.style.width = '150%';
          left2 = -400;
        }
        
        elem2.style.left = left2 + "px";
        
        if (index2 >= specialWin.naruto.length) {
          if (!done) switchImg('defeat', 'kakashi');
          attacking2 = false;
          index2 = 53;
          done = true;
        }
        elem2.src = avatarPath2 + specialWin.naruto[index2];
    }
      
    function switchImg(animation, avatar, duration){
      duration = duration || 100;

      if (avatar === 'kakashi') {
        index = -1;
        clearInterval(thread);
        
        if (animation === 'stance') thread = setInterval(kakashiStanceImg, duration);
        else if (animation === 'attack') thread = setInterval(kakashiAttackImg, duration);
        else if (animation === 'specialAttack') thread = setInterval(kakashiSpecialAttackImg, duration);
        else if (animation === 'defeat') thread = setInterval(kakashiDefeatImg, duration);
      }
      else if (avatar === 'naruto') {
        index2 = -1;
        clearInterval(thread2);
        
        if (animation === 'stance') thread2 = setInterval(narutoStanceImg, duration); 
        else if (animation === 'attack' ) thread2 = setInterval(narutoAttackImg, duration);
        else if (animation === 'specialAttack') thread2 = setInterval(narutoSpecialAttackImg, duration);
        else if (animation === 'specialWin') thread2 = setInterval(narutoSpecialWinImg, duration);
        else if (animation === 'defeat') thread2 = setInterval(narutoDefeatImg, duration);
      }
    }
    
    if (data.action[1] === 'naruto' && !dead2) {
      if (data.action[0] !== 'stance'  && !attacking2) {
        attacking2 = true;
        switchImg(data.action[0], data.action[1]);
      }
      else if (data.action[0] === 'stance'){
        attacking2 = false;
        switchImg(data.action[0], data.action[1]);
      }
    }
    else if (data.action[1] === 'kakashi' && !dead) {
      if (data.action[0] !== 'stance' && !attacking) {
        attacking = true;
        switchImg(data.action[0], data.action[1]);
      }
      else if (data.action[0] === 'stance'){
        attacking = false;
        switchImg(data.action[0], data.action[1]);
      }
    }
  })
});


