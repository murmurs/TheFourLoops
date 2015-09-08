angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', "$firebaseArray", function($scope, Race, $firebaseArray){
    var dataRef = new Firebase('https://popping-heat-272.firebaseio.com/');
    var childRef = dataRef.child('Challenges');

    $scope.tests = $firebaseArray(childRef);
    
    $scope.send = function(){
      $scope.tests.$add({
          Name: $scope.nameContent,
          Question: $scope.questionContent,
          Inputs: JSON.parse($scope.inputContent),
          Outputs: JSON.parse($scope.outputContent),
          Start: $scope.startContent
      });
      $scope.nameContent = "";
      $scope.questionContent = "";
      $scope.inputContent = "";
      $scope.outputContent = "";
      $scope.startContent = "";
    }
  }]);