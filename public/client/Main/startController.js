angular.module('coderace.start', [])
  .controller('startController', ['$scope', '$location', 'socket', 'Race', function($scope, $location, socket, Race){

    //this function parses our cookie for the profileName and 
    //saves it as our user name
    var parseCookie = function(cookie){
      cookie = cookie.split(';');
      var userName;
      for(var i=0; i<cookie.length; i++){
        var currentCookie = cookie[i].trim().split('=');
        if(currentCookie[0] === 'displayName'){
          userName = currentCookie[1];
        }
      }
      return userName;
    }
    
    $scope.username = parseCookie(document.cookie); //Race.username
    
    $scope.start = function(){
      socket.connect();
      socket.emit('username', $scope.username);
      Race.username = $scope.username;
      $location.path('/challenge');
    };

    $scope.authenticate = function(){
      if(!document.cookie) return false;
      return true;
    }

    console.log(document.cookie.split(';'));
  }]);

