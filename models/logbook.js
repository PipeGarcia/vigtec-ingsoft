var mongoose = require('mongoose');

// Esquema de la bitacora
var logbookSchema = mongoose.Schema({
    username: {
		type: String,
	},
    total: {
		type: String,
	},
	titles: {
		type: String,
	},
	links: {
		type: String
	},
	authors: {
		type: String
    },
    topic: {
		type: String
	}
});

var LogBook = module.exports = mongoose.model('LogBook', logbookSchema);

module.exports.saveLogBook = function(newLogBook, callback){
	
	newLogBook.save(callback);
}

module.exports.getLogBook = function(username, callback){
	var query = {username: username};
	LogBook.find(query, callback);
}

module.exports.deleteLogBook = function(username, callback){
	LogBook.remove({ username: username }, function (err) {
  		if (err) return handleError(err);
  		callback();
	});
}