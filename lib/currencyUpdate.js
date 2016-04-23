var _           = require('lodash'); 
var request     = require('request'); 
var parseString = require('xml2js').parseString; 
var Promise     = require('bluebird'); 

var registryUrl = 'http://www.currency-iso.org/dam/downloads/lists/list_one.xml'; 

var getUpdates = function(){
    return new Promise(function(resolve, reject){
        request.get(registryUrl, function(err, response, xml){
            if( err ){
                console.log(err); 
                return reject('Could not fetch currency registry'); 
            }
            
            resolve(xml); 
                
        }); 
    }); 
}; 

var parseXml = function(xml){
    return new Promise(function(resolve, reject){
        parseString(xml, function (err, result) {
            
            if( err ) 
                return reject(err); 
            
            var doc = result['ISO_4217'] || null; 
            
            if( ! doc ) 
                return reject('Could not find node ISO_4217'); 
            
            var currencyTable = doc['CcyTbl'] || null; 
            
            if( ! currencyTable ) 
                return reject('Could not find CcyTbl node'); 
            if( _.isEmpty(currencyTable) ) 
                return reject('CcyTbl is empty'); 
            
            var table = _.first(currencyTable); 
            var data  = table['CcyNtry'] || null; 
            
            if( ! data ) 
                return reject('Could not find CcyNtry node'); 
            
            resolve(data); 
            
        });     
    }); 
}; 

module.exports = function(){
    return getUpdates().then(function(xml){
            return parseXml(xml); 
        })
        .then(function(data){
            
            return data.reduce(function(acc, entry){
                var currency = entry['Ccy'] || null; 
                
                if( _.isEmpty(currency) ) return acc; 
                
                return acc.concat( _.first(currency) ); 
            }, []); 
            
        })
        .catch(function(err){
            console.log('LEVEL', err); 
        });

};  