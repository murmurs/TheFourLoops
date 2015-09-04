angular.module('coderace.race', [])

.controller('RaceController', function($scope){
  $scope.simple = "something simple!";

  var str = "var someFunc = function() { console.log('in the func'); }";
  
  eval(str);
  someFunc();



  $scope.adder = 1;

});