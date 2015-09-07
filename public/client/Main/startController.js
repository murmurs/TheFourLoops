angular.module('coderace.start', [])
  .controller('startController', ['$scope', '$location', function($scope, $location){

    $scope.start = function(){
      $location.path('/challenge');
    };



  }]);