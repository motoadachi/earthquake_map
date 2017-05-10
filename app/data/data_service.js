// data_service.js
'use strict';

angular
    .module("app")
    .service("dataService", dataService);


function dataService($http, $routeParams){
    var self = this;
    this.data = {};
    this.data.query = {date:new Date(), range:1, minMag:4, startTime:{}, endTime:{}}; 
    this.data.source = {};
    this.data.timestamp = 0;
    this.data.updateCallback = {};
    this.data.paramCallback = {};

    // update date, then load data
    this.updateDate = function(date){
        this.data.query.date = date;
        updateStartEndTime();
        update();
    };

    // update range and calculate date, then load data
    this.updateRange = function(range, doUpdate){
        this.data.query.range = range;
        updateStartEndTime();
        update();
    };

    // update magnitude, then load date
    this.updateMag = function(mag, doUpdate){
        this.data.query.minMag = mag;
        update();
    };

    // set update callback
    this.setUpdateCallback = function(func){
        this.data.updateCallback = func;
    };

    // set param callback
    this.setParamCallback = function(func){
        this.data.paramCallback = func;
    };

    // get date
    this.getDate = function(){
        return this.data.query.date;    
    };

    // get range
    this.getRange = function(){
        return this.data.query.range;    
    };

    // get magnitude
    this.getMag = function(){
        return this.data.query.minMag;    
    };
    
    // get source
    this.getSource = function(){
        return this.data.source;
    };

    // update date
    function setDate(date){
        self.data.query.date = date;
        updateStartEndTime();
    }

    // update range and calculate date
    function setRange(range, doUpdate){
        self.data.query.range = range;
        updateStartEndTime();
    }

    // update magnitude
    function setMag(mag, doUpdate){
        self.data.query.minMag = mag;
    }

    // update param and load data
    function update(){
        invokeParamCallback();
        loadData();
    }

    // calculate start time and end time for query
    function updateStartEndTime(){
        var y = parseInt(self.data.query.date.getFullYear());
        var m = parseInt(self.data.query.date.getMonth());
        var d = parseInt(self.data.query.date.getDate());

        self.data.query.startTime = y.toString() + "-" + 
                                    (m+1).toString() + "-" +
                                    d.toString();

        var date = new Date(y, m, d+parseInt(self.data.query.range));
        y = parseInt(date.getFullYear());
        m = parseInt(date.getMonth());
        d = parseInt(date.getDate());
        self.data.query.endTime = y.toString() + "-" + 
                                  (m+1).toString() + "-" +
                                  d.toString();
    }

    // load data from USGS
    function loadData(){
        var usgsUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?" +
                      "format=geojson" +
                      "&starttime="+ self.data.query.startTime +
                      "&endtime="+ self.data.query.endTime +
                      "&minmagnitude="+self.data.query.minMag;
        console.log("usgs:"+usgsUrl);

        $http.get(usgsUrl).then(
            function(result){
                self.data.source = result.data;
                var d = new Date();
                self.data.timestamp = d.getTime();
                if (typeof self.data.updateCallback == 'function'){
                    self.data.updateCallback(self.data.timestamp);
                }
            },
            function(error){
                console.log("error: cannot load earthquake data: "+error);
            }
        );
    }

    // call param callback
    function invokeParamCallback(){
        if (typeof self.data.paramCallback == 'function'){
            self.data.paramCallback();
        }
    }

    // update data from params
    function updateDataFromParams(){
        if ($routeParams === undefined || 
            $routeParams.param === undefined){ 
            return; 
        }

        var params = $routeParams.param.split(':');
        for(var i in params){
            var c = params[i].substr(0,1).toLowerCase();
            if (c == 'd'){
                var date = params[i].substr(1).split('-');
                setDate(new Date(parseInt(date[0]), 
                                 parseInt(date[1])-1,
                                 parseInt(date[2])));
            }else if (c == 'r'){
                var range = parseInt(params[i].substr(1));
                if (range >=1 && range <= 14){
                    setRange(range);
                }
            }else if (c == 'm'){
                var mag = parseInt(params[i].substr(1));
                if (mag >=2 && mag <= 7){
                    setMag(mag);
                }
            }
        }
        
    }

    // Initialize service
    updateDataFromParams();
    updateStartEndTime(); 
    update();
}
