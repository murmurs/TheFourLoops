console.log("we're live with js & express!");

angular.module('coderace', ['ngRoute', 'coderace.race'])
.config(function($routeProvider, $httpProvider){
  $routeProvider
  .when('/', {
    templateUrl: '../public/index.html',
    controller: 'RaceController'
  })
});