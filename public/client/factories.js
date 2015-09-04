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

  dataRef.set({
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

  var factory = {};

  dataRef.child("Challenges/Sum/Question").on("value", function(snapshot) {
    factory.question = [];
    factory.question.push(snapshot.val());
  });
  dataRef.child("Challenges/Sum/Answers/0/Output").on("value", function(snapshot) {
    factory.answer = [];
    factory.answer.push(snapshot.val());
  });
  dataRef.child("Challenges/Sum/Answers/0/Input").on("value", function(snapshot) {
    factory.input = [];
    factory.input.push(snapshot.val());
  });

  return factory;

});