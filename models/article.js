var mongoose = require('mongoose');

// Esquema del articulo
var articleSchema = mongoose.Schema({
    username: {
		type: String,
	},
	title: {
		type: String,
	},
	abstract: {
		type: String
	},
	link: {
		type: String
	}
});

var Article = module.exports = mongoose.model('Article', articleSchema);

module.exports.saveArticle = function(newArticle, callback){	
	newArticle.save(callback);
}

module.exports.getArticleByTitle = function(articleTitle, username, callback){
	var query = {title: articleTitle, username: username};
	Article.find(query, callback);
}

module.exports.getArticles = function(username, callback){
	var query = {username: username};
	Article.find(query, callback);
}