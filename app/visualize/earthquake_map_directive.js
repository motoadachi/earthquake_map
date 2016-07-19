// earthquake_map_directive.js
'use strict';

angular
    .module('app')
    .directive('earthquakeMap', ['$timeout', earthquakeMap]);

function earthquakeMap($timeout){
    var controller = ['$scope', function($scope){
        $scope.source = {features:[]}; 
        $scope.map = null;
        $scope.overlay = null;
        $scope.isMapInitialized = false;
        $scope.isDragged = false;
    }];
    return {
        restrict: 'E',
        replace: true,
        scope:{
            timestamp: '@',
            getSource: '&',
            pos: '@',
            posCallback: '&'
        },
        template:'<div></div>',
        controller:controller,
        link: function(scope, elements, attrs){

            // check timestamp and load source
            scope.$watch("timestamp", function(newValue, oldValue){
                if (newValue === oldValue){ return; }
                updateMap(scope, elements, attrs);
            },true);

            // check position and move map
            scope.$watch("pos", function(newValue, oldValue){
                if (newValue === oldValue){ return; }
                if (scope.isDragged){
                    scope.isDragged = false;
                }else{
                    moveMap(scope, elements, attrs);
                }
            },true);
        }
    };


    // create/update map
    function updateMap(scope, elements, attrs){
        createMap(scope, elements, attrs)
            .then(function(){
                scope.overlay.update();
                scope.overlay.setMap(null);
                scope.overlay.setMap(scope.map);
            });
    }

    // move map
    function moveMap(scope, elements, attrs){
        createMap(scope, elements, attrs)
            .then(function(){
                var pos = getPos(scope, elements, attrs);
                scope.map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
            });
    }

    // create map
    function createMap(scope, elements, attrs){
        return new Promise(function(resolve, reject){
            initMap(scope, elements, attrs, resolve)});
    }

    // get position 
    function getPos(scope, elements, attrs){
        var pos = JSON.parse(scope.pos);
        if (Object.keys(pos).length == 0){ 
            pos.lat = 0;
            pos.lng = 0;
        }
        return pos;
    }

    // initialize map
    function initMap(scope, elements, attrs, callback){
        if (scope.isMapInitialized){ 
            if (callback !== undefined){
                callback();
            }
            return; 
        } 

        scope.source=scope.getSource();

        var pos = getPos(scope, elements, attrs);

        var map = new google.maps.Map(elements[0], 
                      {zoom:5, 
                       center: new google.maps.LatLng(pos.lat, pos.lng), 
                       mapTypeId: google.maps.MapTypeId.TERRAIN,
                       minZoom:3 });

        var northLatBound = 85.0;
        var southLatBound = -83.0;

        google.maps.event.addListener(map, 'idle', function(){
            var projection = map.getProjection();

            var bounds = map.getBounds();
            var neLat = bounds.getNorthEast().lat();
            var swLat = bounds.getSouthWest().lat();

            if (neLat>northLatBound || swLat<southLatBound){
                var boundLat = 0;
                var edgeLat = 0;
                if (neLat>northLatBound){
                    boundLat = northLatBound;
                    edgeLat = neLat;
                }else{
                    boundLat = southLatBound;
                    edgeLat = swLat;
                }

                var center = projection.fromLatLngToPoint(map.getCenter());
                var centerLng = map.getCenter().lng();

                var bound = projection.fromLatLngToPoint(new google.maps.LatLng(boundLat, centerLng));
                var edge = projection.fromLatLngToPoint(new google.maps.LatLng(edgeLat, centerLng));
                var dy = edge.y-bound.y;
       
                if ( Math.abs(dy)>0 ){
                    center.y = center.y-dy;
                    map.setCenter(projection.fromPointToLatLng(center));
                }
            }

            var pos = map.getCenter();
            var latlng = {lat:pos.lat().toFixed(4), lng:pos.lng().toFixed(4)};
            scope.posCallback({pos:latlng});
            scope.isDragged = true;
        });

        scope.map = map;
   
        MapOverlay.prototype = new google.maps.OverlayView();
        var overlay = new MapOverlay(scope, callback);
        overlay.setMap(map);
        scope.overlay = overlay;
    }


    // create custom overlay
    function MapOverlay(scope, callback){
        this.markerLayer;
        this.tooltipLayer;
        this.callback = callback;

        // update source
        this.update = function(){
            scope.source=scope.getSource();
        }

        // add layers.
        this.onAdd = function(){
            this.markerLayer = d3.select(this.getPanes().overlayLayer)
                                 .append("div")
                                 .attr("class", "earthquake1");
            this.tooltipLayer = d3.select(this.getPanes().overlayMouseTarget)
                                  .append("div")
                                  .attr("class", "earthquake2");

            scope.isMapInitialized = true;

            if (this.callback !== undefined){
                this.callback();
            }
        }

        // remove layers
        this.onRemove = function(){
            if (this.markerLayer !== undefined){
                this.markerLayer.remove();
            }
            if (this.tooltipLayer !== undefined){
                this.tooltipLayer.remove();
            }
        }

        // draw 
        this.draw = function(){
            this.addMarkers();
        }

        // draw markers
        this.addMarkers = function(){
            var padding = 100;
            var projection = this.getProjection();
            var markers = this.markerLayer.selectAll("svg")
                                          .data(scope.source.features)
                                          .each(moveMarker)
                                          .enter()
                                          .append("svg:svg")
                                          .each(moveMarker);

            var filter = markers.append("defs")
                                .append("filter")
                                .attr("id", "blur")
                                .append("feGaussianBlur")
                                .attr("stdDeviation", 2);
                            
            var stroke_width=1;
            var translate="translate("+stroke_width+","+stroke_width+")";

            markers.append("svg:circle")
                   .attr("class", "magnitude")
                   .attr("r", getRadius)
                   .attr("cx",padding)
                   .attr("cy", padding)
                   .style("fill", function(d){return getColor(d);})
                   .attr("transform", translate);

            [1.0].forEach(function(item,index){
                markers.append("svg:circle")
                       .attr("class", "outline")
                       .attr("r", function(d){return item*getRadius(d);})
                       .attr("cx", padding)
                       .attr("cy", padding)
                       .attr("transform", translate);
            });
           
            var center_radius = 2;
            markers.append("svg:rect")
                   .attr("class", "depth")
                   .attr("x", padding-center_radius/2)
                   .attr("y", padding)
                   .attr("width", 2*center_radius/2)
                   .attr("height", getDepth)
                   .attr("transform", translate);

            markers.append("svg:rect")
                   .attr("class", "outline")
                   .attr("x", padding-center_radius/2)
                   .attr("y", padding)
                   .attr("width", 2*center_radius/2)
                   .attr("height", getDepth)
                   .attr("transform", translate);

            markers.append("svg:circle")
                   .attr("class", "epicenter")
                   .attr("r", center_radius)
                   .attr("cx", padding)
                   .attr("cy", padding)
                   .attr("transform", translate);

            markers.append("svg:circle")
                   .attr("class", "outline")
                   .attr("r", center_radius)
                   .attr("cx", padding)
                   .attr("cy", padding)
                   .attr("transform", translate);

            markers.append("svg:text")
                   .attr("class", "text_blur")
                   .attr("x", padding)
                   .attr("y", padding)
                   .attr("dx", function(d){return 4+getRadius(d);})
                   .attr("dy", 4)
                   .style("filter", "url(#blur)")
                   .text(getNotation);

            markers.append("svg:text")
                   .attr("class", "text")
                   .attr("x", padding)
                   .attr("y", padding)
                   .attr("dx", function(d){return 4+getRadius(d);})
                   .attr("dy", 4)
                   .text(getNotation);

            var tooltip = d3.select("body")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);

            function showTooltip(d){
                var place = d.properties.place;
                var time = new Date(d.properties.time);
                time = time.toUTCString(); 
                var mag = d.properties.mag;
                var depth = d.geometry.coordinates[2];
    
                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0.8);
                tooltip.html("<span>"+
                             "Place: "+place+"<br>"+
                             "Time: "+time+"<br>"+
                             "Magnitude: "+mag+"<br>"+
                             "Depth: "+depth+" km<br>"+
                             "</span>")
                       .style("left", (d3.event.pageX+5) +"px")
                       .style("top", (d3.event.pageY-28) +"px");

            }

            function hideTooltip(){
                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0);
            }

            var target = this.tooltipLayer.selectAll("svg")
                                          .data(scope.source.features)
                                          .each(moveMarker)
                                          .enter()
                                          .append("svg:svg")
                                          .each(moveMarker);

            target.append("svg:circle")
                   .attr("class", "target")
                   .attr("r", getRadius)
                   .attr("cx",padding)
                   .attr("cy", padding)
                   .attr("transform", translate)
                   .on('mouseover', showTooltip)
                   .on('mouseout', hideTooltip);

            function getNotation(d){
                return "M"+d3.format("0.1f")(d.properties.mag) + ", D"+ 
                       d3.format("0.1f")(d.geometry.coordinates[2])+"km";
            }


            function moveMarker(d){
                var longitude = d.geometry.coordinates[0];
                var latitude = d.geometry.coordinates[1];
    
                var latlng = new google.maps.LatLng(latitude,longitude);
                var p = projection.fromLatLngToDivPixel(latlng);
                return d3.select(this)
                         .style("left",(p.x-padding)+"px")
                         .style("top",(p.y-padding)+"px");
            }
        
            function clamp(vmin, vmax, v){
                return Math.max(vmin, Math.min(vmax, v));
            }
               
            function getRadius(d){
                var magMin=2, magMax=8;
                var t = (clamp(magMin, magMax, d.properties.mag)-magMin)/(magMax-magMin);
                return 30*t+4;
            }
        
            function getDepth(d){
                var depthMin=0, depthMax=150;
                var t = (clamp(depthMin,depthMax,d.geometry.coordinates[2])-depthMin)/
                        (depthMax-depthMin); 
                return 50*t+center_radius;
            }
    
            function getColor(d){ 
                var colors = ["#00ff22", "#ffeb00", "#ffcd00", "#ffaf00", 
                      "#ff9500", "#ff7300", "#ff5100", "#ff0000"];
                var m = Math.floor(d.properties.mag);
                if (m>7){
                    return colors[7];
                }else{
                    return colors[m];
                }
            }
        }

    }
}

