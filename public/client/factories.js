angular.module('coderace.factories', [])

.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})

.factory('Race', function ($rootScope) {
  var factory = {};
  // var problem = null;

  factory.dataRef = new Firebase("https://popping-heat-272.firebaseio.com/");

  // factory.dataRef.child("Challenges").set([
  //   {
  //     functionName: "sum",
  //     question: "Write a sum function that sums up all of its parameters",
  //     inputs: [[1,2,3], [10, 20, 3]],
  //     answers: [6, 33],
  //     startingCode: "var sum = function() {}"
  //   },
  //   {
  //     functionName: "reverse",
  //     question: "Write a reverse function that reverses the string",
  //     inputs: ['run', 'face'],
  //     answers: ['nur', 'ecaf'],
  //     startingCode: "var reverse = function() {}"
  //   }
  // ]);

  /*  called by slave user  */
  factory.setProblem = function(data){
    $rootScope.problem = data;
    $rootScope.$broadcast('Race:ready', $rootScope.problem);
  };

  /*  called by master user, call to Firebase to get problem  */
  factory.getData = function(index, callback){
    factory.dataRef.child("Challenges").child(index).on("value", function(snapshot) {
      var problem = snapshot.val();
      $rootScope.$broadcast('Race:ready', problem);
      callback(problem);// send slave the problem
    });
  };
  
  factory.getLength = function(){
    factory.dataRef.child("Challenges").on("value", function(snapshot) {
      var challenges = snapshot.val();
      $rootScope.$broadcast('GotLength', challenges.length);
    });
  };

  return factory;

});

