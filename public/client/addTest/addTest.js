angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', "$firebaseArray", function($scope, Race, $firebaseArray){
    Race.getLength();

    $scope.$on('GotLength', function(event, data){
      $scope.tests = Race.dataRef.child('Challenges/' + data + "/");
      $scope.send = function(){
        $scope.tests.set(
          {
            Name: $scope.nameContent,
            Question: $scope.questionContent,
            Inputs: JSON.parse($scope.inputContent),
            Outputs: JSON.parse($scope.outputContent),
            Start: $scope.startContent
          }
        );
        $scope.nameContent = "";
        $scope.questionContent = "";
        $scope.inputContent = "";
        $scope.outputContent = "";
        $scope.startContent = "";
      }
    })

  }]);
