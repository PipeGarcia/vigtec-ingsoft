var express = require('express');
var router = express.Router();
var arxiv = require('arxiv');
var LogBook = require('../models/logbook');

router.get('/', checkIfLogged, function(req, res){
	res.render('index');
});

function checkIfLogged(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {		
		res.redirect('/login');
	}
}

router.post('/', function(req, res, next){
	var key = req.user.username + '-key';
	var username = req.user.username;
  	var topic = req.body.topic;
	
	var search_query = {
		all: topic
		//author: 'William Chan'
	};
	arxiv.search(search_query, function (err, results) {
		
		var resultados = results.items;
		var cantidadArticulos = results.items.length;
		var titulos = "";
		var links = "";
		var autores = "";

		for (var a = 0; a < 5; a++) {
		  
			if(a==0){
				titulos = (a+1) + '. ' + results.items[a].title;
				links = 'Articulo' + (a+1) + ': ' + results.items[a].links[1].href;
				autores = results.items[a].authors[0].name;
			}else{
				titulos = titulos + '. ' + (a+1) + '. ' +  results.items[a].title;
				links = links + " Articulo" + (a+1) + ': ' + results.items[a].links[1].href;
				autores = autores + " - " + results.items[a].authors[0].name;
			}		  
		}

		var newLogBook = new LogBook({
			username: username,
			total: cantidadArticulos,
			titles:titulos,
			links: links,
			authors: autores,
			topic: topic
		});

		LogBook.getLogBook(username, function(err, logbook){

			if(err) throw err;
			var topicsArray = [];

			for(var i=0;i<logbook.length;i++){
				topicsArray.push(logbook[i].topic);
			}

			if(!topicsArray.includes(topic)){
				LogBook.saveLogBook(newLogBook, function(err, logbook){
					if(err) throw err;
				});
			}

		});

		res.render('results', {resultados: resultados});

	});
});

module.exports = router;