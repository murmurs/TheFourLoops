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

  factory.obj = {
      sum: {
        Name: "sum",
        Question: "Write a sum function that sums up all of its parameters.",
        Inputs: [[1,2,3], [10,20,3]],
        Outputs: [6, 33],
        Start: "var sum = function(){}"
      },
      reverse: {
        Name: "reverse",
        Question: "Write a reverse function that reverses the string.",
        Inputs: ["run", "face"],
        Outputs: ["nur", "ecaf"],
        Start: "var reverse = function(){}"
      }
    };

  (factory.init = function(){
    factory.dataRef.set({
      Challenges: factory.obj
    });
  })();

  factory.getData = function(){
    factory.question = [];
    factory.input = [];
    factory.output = [];
    factory.name = [];
    factory.start = [];

    factory.dataRef.child("Challenges").on("value", function(snapshot) {
      var obj = snapshot.val();
      for(var key in obj){
        factory.name.push(obj[key].Name);
        factory.question.push(obj[key].Question);
        factory.input.push(obj[key].Inputs);
        factory.output.push(obj[key].Outputs);
        factory.start.push(obj[key].Start);
      };
    });
  }

  return factory;

});