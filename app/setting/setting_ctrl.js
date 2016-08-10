// setting_ctrl.js 
'usr strict';

angular
    .module("app")
    .controller("settingCtrl", settingCtrl);

function settingCtrl($scope, $timeout, dataService, visService){
    $scope.dataService = dataService;
    $scope.visService = visService;
    $scope.setting = {};
    $scope.setting.date = dataService.getDate();
    $scope.setting.range = dataService.getRange();
    $scope.setting.mag = dataService.getMag();
    $scope.setting.rangeOptions = [1, 3, 5, 7, 14];
    $scope.setting.magOptions = [2, 3, 4, 5, 6, 7];
    $scope.setting.city = getClosestCity();
    $scope.setting.cityOptions = ['Tokyo', 'Los Angeles', 'Peru', 'Sumatra', 'Mexico city', 'Rome', 'Other'];
    $scope.setting.settingCallback = settingCallback;
    $scope.setting.updateDate = updateDate;
    $scope.setting.updateMag = updateMag;
    $scope.setting.updateRange = updateRange;
    $scope.setting.updateCity = updateCity;

    // update date
    function updateDate(){
        $scope.dataService.updateDate($scope.setting.date);
    }

    // update magnitude
    function updateMag(){
        $scope.dataService.updateMag($scope.setting.mag);
    }

    // update range
    function updateRange(){
        $scope.dataService.updateRange($scope.setting.range);
    }

    // update postion by city
    function updateCity(){
        var city = $scope.setting.city;
        if (city != "Other"){
            var cityPos = getCityPos();
            var pos = cityPos[city];
            $scope.visService.updatePos(pos);
        }
    }

    // get position of city
    function getCityPos(){
        return {'Tokyo':{lat:35.6895, lng:139.6917},
                'Los Angeles':{lat:34.0522, lng:-118.2447},
                'Peru':{lat:-9.1900, lng:-75.0152},
                'Sumatra':{lat:-0.5897, lng:101.3431},
                'Mexico city':{lat:23.6345, lng:-102.5528},
                'Rome':{lat:41.9028, lng:12.4964}
               };
    }

    // find the closed city to the specified position
    function getClosestCity(){
        var pos = visService.getPos();
        var cityPos = getCityPos();
        for(var city in getCityPos()){
            var p = cityPos[city];
            var dlat = pos.lat-p.lat;
            var dlng = pos.lng-p.lng;
            if (Math.sqrt(dlat*dlat+dlng*dlng) <= 0.001){
                return city;
            }
        }
        return "Other";
    }

    // set city
    function settingCallback(){
        $timeout(function(){
            $scope.$apply(function(){
                var city = getClosestCity();
                if (city !== $scope.setting.city){
                    $scope.setting.city = getClosestCity();
                }
            })
        }, 10);
    }

    // set city callback
    visService.setSettingCallback($scope.setting.settingCallback);
}
  
