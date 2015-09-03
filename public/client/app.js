console.log("we're live with js & express!");

angular.module('coderace', ['coderace.race', 'ngRoute'])
.config(function($routeProvider, $httpProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'client/Race/race.html',
    controller: 'RaceController'
  })
});