console.log("we're live with js & express!");

angular.module('coderace', ['coderace.factories','coderace.race', 'ngRoute'])
.config(function($routeProvider, $httpProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'client/Race/sum.html',
    controller: 'sumController'
  })
});