// shell_ctrl.js
'use strict';

angular
    .module("app")
    .controller("shellCtrl", shellCtrl);

function shellCtrl($scope, $route, $routeParams, $location, $timeout, dataService, visService){
    $scope.shell = {};
    $scope.shell.timestamp = 0;
    $scope.shell.pos = visService.getPos();
    $scope.shell.param = "";
    $scope.shell.visMode = 'Map';
    $scope.shell.visModeOptions = ['Map', 'Detail'];
    $scope.shell.showMap = true;
    $scope.shell.showDetail = false;
    $scope.shell.posCallback = posCallback;
    $scope.shell.updateSource = updateSource;
    $scope.shell.updatePos = updatePos;
    $scope.shell.updateParam = updateParam;
    $scope.shell.getSource = getSource;

    // set services
    $scope.dataService = dataService;
    $scope.visService = visService;

    // set callbacks to services
    $scope.dataService.setUpdateCallback($scope.shell.updateSource);
    $scope.visService.setUpdateCallback($scope.shell.updatePos);
    $scope.dataService.setParamCallback($scope.shell.updateParam);
    $scope.visService.setParamCallback($scope.shell.updateParam);

    // toggle map view and detail view
    $scope.$watch(
        function(scope){return scope.shell.visMode;},
        function(newValue, oldValue){
            if (newValue === oldValue){ return; }
            if (newValue == "Map"){
                $scope.shell.showMap = true;
                $scope.shell.showDetail = false;
            }else{
                $scope.shell.showMap = false;
                $scope.shell.showDetail = true;
            }
        }
    );

    // get position data from earthquake map and store it to visService.
    function posCallback(pos){
        if ( $scope.shell.pos.lat !== pos.lat || $scope.shell.pos.lng !== pos.lng){
            visService.updatePos(pos);
        }
    }

    // update timestamp of source to trigger earthquake_{map|detail}_directive
    function updateSource(timestamp){
        $scope.shell.timestamp = timestamp;
    }

    // get source from dataService inside earthquake_{map|detail}_directies
    function getSource(){
        return dataService.getSource();
    }

    // get position data from visService
    function updatePos(pos){
        if ($scope.shell.pos.lat !== pos.lat || $scope.shell.pos.lng !== pos.lng){
            $scope.shell.pos = pos;
        }
    }

    // update param as data in dataService was updated.
    function updateParam(){
        var d = $scope.dataService.getDate();
        var date = d.getFullYear().toString() + "-" +
                   (d.getMonth()+1).toString() + "-" +
                   d.getDate().toString();
        var range = $scope.dataService.getRange().toString();
        var mag = $scope.dataService.getMag().toString();
        var pos = $scope.visService.getPos(); 

        var param = "/" +
                    "d" + date + ":" +
                    "r" + range + ":" +
                    "m" + mag + ":" +
                    "@" + pos.lat + "," + pos.lng;

        if (param !== $scope.shell.param){ 
            $scope.shell.param = param;
            $timeout(function(){
                $scope.$apply(function(){
                    $location.path(param, false);
                })
            }, 10);
        }
    }
}
