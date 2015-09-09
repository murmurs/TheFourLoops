angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', function($scope, Race){
    Race.getLength();

    $scope.$on('GotLength', function(event, data){
      $scope.tests = Race.dataRef.child('Challenges/' + data + "/");
      $scope.send = function(){
        $scope.tests.set(
          {
            functionName: $scope.nameContent,
            question: $scope.questionContent,
            inputs: JSON.parse($scope.inputContent),
            answers: JSON.parse($scope.outputContent),
            startingCode: $scope.startContent
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
