angular.module('coderace.factories', [])

.factory('socket', function ($rootScope) {
  var socket = io.connect();

  var factory = {};

  factory.on = function (eventName, callback) {
    socket.on(eventName, function () {  
      var args = arguments;
      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  };

  factory.emit = function (eventName, data, callback) {
    socket.emit(eventName, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    });
  };

  factory.disconnect = function(){
    socket.disconnect();
  };

  factory.connect = function(){
    socket.connect();
  };

  return factory;
})

.factory('Race', function ($rootScope) {
  var factory = {};
  
  factory.username;

  factory.dataRef = new Firebase("https://popping-heat-272.firebaseio.com/");

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
      $rootScope.$broadcast('GotLength');
    });
  };

  return factory;

});

