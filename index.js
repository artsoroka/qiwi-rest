var request = require('request'); 
var date    = require('./lib/date'); 
var extend  = require('util')._extend;
var Promise = require('bluebird'); 

var base64 = function(username, password){
    return new Buffer([username, password].join(':')).toString('base64'); 
}; 



function Qiwi(){}  

Qiwi.prototype.client = function(config){
    this.SHOP_ID  = config.shopId  || null; 
    this.APP_ID   = config.appId   || null;
    this.API_PASS = config.apiPass || null; 
    
    return this; 
}; 

Qiwi.prototype._makeRequest = function(params){
    var headers = {
        'Accept'       : 'application/json', 
    	'Authorization': 'Basic ' + base64(this.APP_ID, this.API_PASS) 
    }; 
    
    extend(params, {headers: headers}); 
    extend(params.form, {
        lifetime: date(2, 'h') 
    }); 

    return new Promise(function(resolve, reject){
        request(params, function(err, response, data){
            if( err ){
                return reject(err); 
            } 
            
            resolve(data, response); 
        
        }); 

    }); 
    
}; 

Qiwi.prototype.createInvoice = function(data){
    
    return this._makeRequest({
        method: 'PUT', 
        uri: 'https://api.qiwi.com/api/v2/prv/' + this.SHOP_ID + '/bills/' + data.id, 
        form: data
    }); 
    
}; 

module.exports = new Qiwi(); 