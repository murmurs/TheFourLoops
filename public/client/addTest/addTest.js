angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', function($scope, Race){
    var chalRef = Race.dataRef.child('Challenges');

    $scope.send = function(){
      chalRef.push({
        Name: $scope.nameContent,
        Question: $scope.questionContent,
        Inputs: $scope.inputContent,
        Outputs: $scope.outputContent,
        Start: $scope.startContent
      });
      $scope.nameContent = "";
      $scope.questionContent = "";
      $scope.inputContent = "";
      $scope.outputContent = "";
      $scope.startContent = "";
    }

  }]);