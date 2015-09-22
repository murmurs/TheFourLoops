angular.module('coderace.test', [])
  .controller('testController', ['$scope', 'Race', function($scope, Race){

    Race.getLength();//first you invoke the function get length method inside the race factory to retireve the total numebr of tests in databse

    $scope.$on('GotLength', function(event, data){//once we recieved the length from the database, we trigger event listener
      $scope.tests = Race.dataRef.child('Challenges').push();

      $scope.send = function(){ //once the user hits the submit button, the contents will be sent to the database
        $scope.tests.set(
          {
            functionName: $scope.nameContent,
            question: $scope.questionContent,
            inputs: JSON.parse($scope.inputContent),
            answers: JSON.parse($scope.outputContent),
            startingCode: $scope.startContent
          }
        );
        //after we sent the database all of our data, we make the input bar an empty string to clear out the data so the user can send soemthing new if they wish
        $scope.nameContent = "";
        $scope.questionContent = "";
        $scope.inputContent = "";
        $scope.outputContent = "";
        $scope.startContent = "";
      }
    })

  }]);
