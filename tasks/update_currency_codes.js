var _      = require('lodash'); 
var fs     = require('fs'); 
var update = require('../lib/currencyUpdate'); 
         
update()
    .then(function(ccyList){
        if( _.isEmpty(ccyList) ){
            return console.log('No data to save'); 
        }
        
        fs.writeFileSync(__dirname + '/../currency.list', ccyList.join(',')); 
            
    }).catch(function(err){
        console.log('TOP', err); 
    }); 