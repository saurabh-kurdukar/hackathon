angular.module('appRoutes', ['ui.router']).config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  // For any unmatched url, redirect to following state
  $urlRouterProvider.otherwise('/default');
  // Now set up the states
  $stateProvider.state('default', {
    url: '/default',
    templateUrl: 'views/default.html',
    controller: 'defaultController'
  }).state('home', {
    url: '/home',
    templateUrl: 'views/home.html',
    controller: 'homeController'
  }).state('newKYC', {
    url: '/newKYC',
    templateUrl: 'views/newKYC.html',
    controller: 'newKYCController'
  }).state('updateKYC', {
    url: '/updateKYC',
    templateUrl: 'views/updateKYC.html',
    controller: 'updateKYCController'
  }).state('verify', {
    url: '/verify',
    templateUrl: 'views/verify.html',
    controller: 'verifyController'
  });
});