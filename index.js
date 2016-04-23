var request = require('request'); 
var date    = require('./lib/date'); 
var extend  = require('util')._extend;
var Promise = require('bluebird'); 

var BASE_URL = 'https://api.qiwi.com/api/v2'; 

var base64 = function(username, password){
    return new Buffer([username, password].join(':')).toString('base64'); 
}; 



function Qiwi(){}  

Qiwi.prototype.client = function(config){
    this.SHOP_ID   = config.shopId   || null; 
    this.SHOP_NAME = config.shopName || null; 
    this.APP_ID    = config.appId    || null;
    this.API_PASS  = config.apiPass  || null; 
    
    return this; 
}; 

Qiwi.prototype._configRequest = function(params){
    
    var headers = {
        'Accept'       : 'application/json', 
    	'Authorization': 'Basic ' + base64(this.APP_ID, this.API_PASS) 
    }; 
    var metadata = {
        lifetime: date(2, 'h'), 
        prv_name: this.SHOP_NAME 
    }; 
    
    return new Promise(function(resolve, reject){
        
        extend(params, {headers: headers}); 
        
        if(params.method != 'GET'){
            extend(params.form, metadata); 
        }
        
        resolve(params); 
        
    }); 
}; 

Qiwi.prototype._makeApiCall = function(params){
    
    return new Promise(function(resolve, reject){
        request(params, function(err, response, data){
            if( err ){
                return reject(err); 
            } 
            
            resolve(data, response); 
        
        }); 

    }); 
    
}; 

Qiwi.prototype._parseApiResponse = function(response){
    return new Promise(function(resolve, reject){
        try{
            var data = JSON.parse(response); 
        } catch(e){
            console.log(e); 
            throw Error('Invalid API response: could not parse JSON string' + response); 
        }
        
        if( !  data.response ){
            throw Error('Invalid API response: "response" property is missing');         
        } 
            
        resolve(data.response); 
    }); 
}; 

Qiwi.prototype._makeRequest = function(params){
    var self = this; 
    return this
            ._configRequest(params)
            .then(function(request){
                return self._makeApiCall(request); 
            })
            .then(function(response){
                return self._parseApiResponse(response); 
            })
            .catch(function(err){
                console.log('error', err); 
                throw err; 
            }); 

}; 

Qiwi.prototype._parseApiError = function(response){
    return (response.description) ? response.description : 'UNKNOWN ERROR'; 
}; 

Qiwi.prototype.createInvoice = function(data){
    var self = this; 
    return this
            ._makeRequest({
                method: 'PUT', 
                uri: [BASE_URL, 'prv', this.SHOP_ID, 'bills', data.id].join('/'), 
                form: data
            })
            .then(function(response){
                if( response.result_code != 0){
                    console.log('API responded with error code %d', response.result_code); 
                    throw Error(self._parseApiError(response)); 
                }
                    
                return response.bill; 
            }); 
    
}; 

Qiwi.prototype.checkInvoiceStatus = function(invoiceId){
    var self = this; 
    return this
            ._makeRequest({
                method: 'GET', 
                uri: [BASE_URL, 'prv', this.SHOP_ID, 'bills', invoiceId].join('/') 
            })
            .then(function(response){
                if( response.result_code != 0){
                    console.log('API responded with error code %d', response.result_code); 
                    throw Error(self._parseApiError(response)); 
                }
                
                return response.bill; 
                
            }); 
    
}; 

module.exports = new Qiwi(); 