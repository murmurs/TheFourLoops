angular.module('coderace.start', [])
  .controller('startController', ['$scope', '$http', 'socket', 'Race', function($scope, $http, socket, Race){

    $scope.username = Race.username;
    
    $scope.start = function(){
      socket.connect();
      socket.emit('username', $scope.username);
      Race.username = $scope.username;
      $location.path('/challenge');

    };

  }]);

