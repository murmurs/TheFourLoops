angular.module('coderace.start', [])
  .controller('startController', ['$scope', '$location', 'socket', 'Race', function($scope, $location, socket, Race){

    $scope.username = Race.username;
    
    $scope.start = function(){
      socket.connect();
      socket.emit('username', $scope.username);
      Race.username = $scope.username;
      $location.path('/challenge');

    };

    $scope.facebookLogin = function(){
        $location.path('/auth-facebook');
    }

  }]);

