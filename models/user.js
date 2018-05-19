var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

//el primer parametro es para el nombre de la coleccion, toma la palabra en plural
module.exports.createUser = function(newUser, callback){	
    newUser.save(callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(username, candidatePassword, callback){	
	var isMatch = true;
	User.findOne({username: username, password:candidatePassword}, function (err, person) {
  		if (err) return handleError(err);
		callback(null, person);
	});
}

module.exports.updateUsername = function(id, username, callback){
	User.findByIdAndUpdate(id, { $set: { username: username }}, { new: true }, function (err, user) {
  		if (err) return handleError(err);
	});
}

module.exports.removeUser = function(id, callback){
	User.remove({ _id: id }, function (err) {
  		if (err) return handleError(err);
	});
}

module.exports.updateEmail = function(id, email, callback){
	User.findByIdAndUpdate(id, { $set: { email: email }}, { new: true }, function (err, user) {
  		if (err) return handleError(err);
	});
}

module.exports.checkPassword = function(username, oldPassword, callback){
	User.findOne({username: username, password: oldPassword}, function(err, person){
  		callback(null, person);
	});
}

module.exports.updatePassword = function(username, newPassword, callback){
	User.update({username: username}, { $set: { password: newPassword }}, function(err, person){
  		callback(null, person);
	});
}