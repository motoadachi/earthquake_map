// earthquake_detail_directive.js
'usr strict';

angular
    .module('app')
    .directive('earthquakeDetail', earthquakeDetail);

function earthquakeDetail(){
    var controller = ['$scope', '$window', function($scope, $window){
        $scope.items = [];
        $scope.updateData = function(){
            $scope.items = [];
            var data = $scope.getSource();
            for(var i in data.features){
                var obj = data.features[i];
                var title = obj.properties.title;
                var time = new Date(obj.properties.time);
                var date = time.toUTCString(); 
                var place = obj.properties.place;
                var lat = obj.geometry.coordinates[1].toFixed(1);
                var lng = obj.geometry.coordinates[0].toFixed(1);
                var mag = obj.properties.mag;
                var depth = obj.geometry.coordinates[2].toFixed(1);
                var url = obj.properties.url;
                $scope.items.push({title:title, place:place, date:date, lat:lat, lng:lng,
                                   mag:mag, depth:depth, url:url});
            }
        };
        $scope.showMoreInfo = function(url){
            $window.open(url, '_blank');
        };
    }];

    var template = '<div layout="column" ng-cloak>' +
                   '<md-content>' +
                   '<md-list flex>' +
                   '<md-list-item class="md-3-line secondary-button-padding" ng-repeat="item in items">' +
                   '<div class="md-list-item-text" layout="column">' +
                   '<h3>{{item.title}}</h3>' +
                   '<h4>Date: {{item.date}}</h4>' +
                   '<h4>Latitude: {{item.lat}}&deg;,  Longitude: {{item.lng}}&deg;,  Depth: {{item.depth}}km</h4>' +
                   '<md-button class="md-secondary" ng-click="showMoreInfo(item.url)">More Info</md-button>' +
                   '</div>' +
                   '<md-divider></md-divider>' +
                   '</md-list-item>' +
                   '</md-list>' +
                   '</md-content>' +
                   '</div>';

    return {
        restrict: 'E',
        replace: true,
        scope:{
            timestamp: '@',
            getSource: '&'
        },
        template:template,
        controller:controller,
        link: function(scope, elements, attrs){

            // check timestamp and load source
            scope.$watch("timestamp", function(newValue, oldValue){
                if (newValue === oldValue){ return; }
                updateView(scope, elements, attrs);
            },true);
        }
    };

    // update view
    function updateView(scope, elements, attrs){
        scope.updateData(); 
    }
}

