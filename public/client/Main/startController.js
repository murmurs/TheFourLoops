angular.module('coderace.start', [])
  .controller('startController', ['$scope', '$location', 'socket', 'Race', function($scope, $location, socket, Race){
    $scope.username = 'Fighters user handle';
    $scope.start = function(){
      socket.connect();
      socket.emit('username', $scope.username);
      // Race.username = $scope.username;
      $location.path('/challenge');
    };

    $scope.authenticate = function(){
      if(!document.cookie) return false;
      return true;
    }

  }]);

