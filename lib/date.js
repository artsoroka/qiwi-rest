var moment   = require('moment-timezone'); 
var timezone = 'Europe/Moscow'; 
var now      = moment().tz(timezone); 

module.exports = function(offset, units){
	return now.add(offset, units).format(); 
}