console.log("we're live with js & express!");

angular.module('coderace', ['coderace.factories','coderace.race', 'ngRoute', 'coderace.start'])
.config(function($routeProvider, $httpProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'client/Main/start.html',
    controller: 'startController'
  })
  .when('/challenge', {
    templateUrl: 'client/Race/race.html',
    controller: 'raceController'
  })
  .otherwise({
    redirectTo: '/'
  })
});