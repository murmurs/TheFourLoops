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


  factory.getData = function(index){
    factory.dataRef.child("Challenges").child(index).on("value", function(snapshot) {
      var data = snapshot.val();
      $rootScope.$broadcast('Race:ready', snapshot.val());
    });
  }
  
  factory.getLength = function(){
    factory.dataRef.child("Challenges").on("value", function(snapshot) {
      var challenge = snapshot.val();
      $rootScope.$broadcast('GotLength', challenge.length);
    });
  }

  return factory;

});