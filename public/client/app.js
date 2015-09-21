angular.module('coderace', ['coderace.factories','coderace.race', 'ngRoute', 'coderace.start', 'coderace.test', 'ui.codemirror'])

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
  .when('/addTest', {
    templateUrl: 'client/addTest/addTest.html',
    controller: 'testController'
  })
  .when('/aboutUs', {
    templateUrl: 'client/aboutUs/aboutUs.html',
    controller: 'aboutUsController'
  })
  .otherwise({
    redirectTo: '/'
  })
});