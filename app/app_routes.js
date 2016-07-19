// app_routes.js
'use strict';

angular
    .module('app')
    .config(['$routeProvider', config]);

function config($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'app/layout/shell.html',
            controller: 'shellCtrl'})
        .when('/:param', {
            templateUrl: 'app/layout/shell.html',
            controller: 'shellCtrl'})
        .otherwise({redirectTo: '/'})
}
