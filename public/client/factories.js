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
  var dataRef = new Firebase("https://popping-heat-272.firebaseio.com/");

  dataRef.push({
    Challenges: {
      Sum: {
        Question: "Write a sum function that sums up all of its parameters.",
        Answers: [
          {"Input": [1,2,3], "Output": 6},
          {"Input": [10,20,3], "Output": 33}
        ]
      }
    }
  });
  dataRef.push({
    Challenges: {
      Reverse: {
        Start: "var reverse = function(){}",
        Question: "Write a reverse function that reverse the strings",
        Answers: [
          {"Input": "run", "Output": "nur"},
          {"Input": "out", "Output": "tuo"}
        ]
      }
    }
  });

  var factory = {};
  factory.question = [];
  factory.answer = [];
  factory.input = [];

  dataRef.child("Challenges/Sum").on("value", function(snapshot) {
    factory.question.push(snapshot.Question.val());
    console.log(snapshot);
  });

  return factory;

});