angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', "$firebaseArray", function($scope, Race, $firebaseArray){
    var childRef = Race.dataRef.child('Challenges');

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