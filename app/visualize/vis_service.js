// vis_service.js 
'use strict';

angular
    .module('app')
    .service('visService', visService);

function visService($routeParams){
    var self = this;
    this.vis = {};
    this.vis.pos = {lat:35.6895, lng:139.6917}; // Tokyo
    this.vis.updateCallback = {};
    this.vis.paramCallback = {};
    this.vis.settingCallback = {};

    // update position
    this.updatePos = function(pos){
        if ( this.vis.pos.lat !== pos.lat || this.vis.pos.lng !== pos.lng){
            this.vis.pos = pos;
            if (typeof this.vis.updateCallback == 'function'){
                self.vis.updateCallback(this.vis.pos);
            }
            if (typeof this.vis.paramCallback == 'function'){
                self.vis.paramCallback();
            }
            if (typeof this.vis.settingCallback == 'function'){
                self.vis.settingCallback();
            }
        }
    };

    // get position
    this.getPos = function(pos){
        return this.vis.pos;
    };

    // set update callback
    this.setUpdateCallback = function(func){
        this.vis.updateCallback = func;
    };

    // set param callback
    this.setParamCallback = function(func){
        this.vis.paramCallback = func;
    };

    // set setting callback
    this.setSettingCallback = function(func){
        this.vis.settingCallback = func;
    };

    // get postion data from param
    function updatePosFromParams(){
        if ($routeParams === undefined || 
            $routeParams.param === undefined){ 
            return; 
        }

        var params = $routeParams.param.split(':');
        for(var i in params){
            var c = params[i].substr(0,1).toLowerCase();
            if (c == '@'){
                var pos = params[i].substr(1).split(',');
                self.updatePos({lat:clamp(parseFloat(pos[0]), -90, 90),
                                lng:clamp(parseFloat(pos[1]), -180, 180)});
            }
        }
        
    }

    // clamp value
    function clamp(v, vMin, vMax){
        return Math.min(Math.max(v,vMin), vMax);
    }


    // initialize service
    updatePosFromParams();
}
