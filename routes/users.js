var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user');
var LogBook = require('../models/logbook');

router.get('/register', function(req, res){
	res.render('register');
});


router.get('/login', function(req, res){
	res.render('login');
});


router.post('/register', function(req, res){
	
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validaciones de campos
	req.checkBody('name', 'El Nombre es requerido').notEmpty();
	req.checkBody('email', 'El Email es requerido').notEmpty();
	req.checkBody('email', 'La dirección email no es válida').isEmail();
	req.checkBody('username', 'El Nombre de Usuario es requerido').notEmpty();
	req.checkBody('password', 'Contraseña requerida').notEmpty();
	req.checkBody('password2', 'Las contraseñas no coinciden').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors // renderiza la pagina de registro y pasa los errores
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Registro exitoso! - Ya puedes iniciar sesión');

		res.redirect('/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Usuario desconocido'});
   	}

   	User.comparePassword(user.username, password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Contraseña incorrecta'}); //el segundo parametro es el resultado
   		}
   	});
   });
  }));

//localhost
/*	clientID: '32652853190-kgupu5a74ohvt6g6fagp84lksek7s0ns.apps.googleusercontent.com',
    clientSecret: '5uZF6lLJFBuyRpVNxYaX08Pv',
    callbackURL: "http://localhost:3009/auth/google/callback"*/

passport.use(new GoogleStrategy({
    clientID: '32652853190-ihuq1rk30nii5r71f3eanc8oc5agdm27.apps.googleusercontent.com',
    clientSecret: 'RF4Oc83bN3Q8Gj0vfaI1LmW7',
    callbackURL: "https://vigtec-ingsoft.herokuapp.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  		process.nextTick(function(){
	       	User.getUserByUsername(profile.id, function (err, user) {

	        	if(err)
					return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User({
							name: profile.displayName,
							email: profile.emails[0].value,
							username: profile.id
						});


						User.createUser(newUser, function(err, user){
							if(err) throw err;
							console.log(user);
						});

	    				console.log(profile);
		    		}
	    	});

       	});
  }
));

//Solicitar a Google los campos pasados en scope
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

//Redirigir después de autenticarse con Google
router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect:'/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', //para loguearse
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
  function(req, res) { //local porque es una base de datos local
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Cerraste sesión!');

	res.redirect('/login');
});

router.get('/settings1', function(req, res){
	res.render('settings1');
});

router.get('/settings2', function(req, res){
	res.render('settings2');
});

router.post('/settings2', function(req, res, next){

	console.log(req.user);
	console.log(req.body.username);

	User.updateUsername(req.user._id, req.body.username, function(req, res){
		return next();
	});
	
	req.flash('success_msg', 'Se ha cambiado el nombre de usuario');
	res.redirect('/settings2');
});

router.get('/settingsEliminar', function(req, res){
	res.render('settingsEliminar');
});

router.post('/settingsEliminar', function(req, res){

	User.comparePassword(req.user.username, req.body.password, function(err, isMatch){
		console.log('ismatch------------------------------------- ' + isMatch);
   		if(err) throw err;

   		if(isMatch){
   			User.removeUser(req.user._id, function(){
   				return next();
   			});
			res.redirect('/login');
			req.flash('success_msg', 'Usuario eliminado');   			
   		}else{
   			req.flash('error_msg', 'Contraseña incorrecta');
			res.redirect('/settingsEliminar');
   		}
   	});
});

router.get('/settingsEmail', function(req, res){
	res.render('settingsEmail');
});

router.post('/settingsEmail', function(req, res, next){
	
	User.updateEmail(req.user._id, req.body.email, function(req, res){
		return next();
	});
	
	req.flash('success_msg', 'Se ha cambiado el email');
	res.redirect('/settingsEmail');
});

router.get('/settingsPassword', function(req, res){
	res.render('settingsPassword');
});

router.post('/settingsPassword', function(req, res){	

	User.checkPassword(req.user.username, req.body.oldPassword, function(err, person){
		if(person){
			User.updatePassword(req.user.username, req.body.newPassword, function(){
				req.flash('success_msg', 'Contraseña cambiada!');
				res.redirect('/settingsPassword');
			});
		}else{
			req.flash('error_msg', 'Contraseña anterior incorrecta!');
			res.redirect('/settingsPassword');
		}
	});
});

router.get('/logbook', function(req, res){
	res.render('logbook');
});

router.post('/logbook', function(req, res){	
	var username = req.user.username;

	LogBook.getLogBook(username, function(err, logbook){
		if(err) throw err;
		res.render('resultsLogbook', {lb: logbook});
	});
	
});

router.post('/deleteLogBook', function(req, res){	
	var username = req.user.username;

	LogBook.deleteLogBook(username, function(err, logbook){
		if(err) throw err;

		req.flash('success_msg', 'Bitácora eliminada!');

		res.redirect('/logbook');
	});
	
});

module.exports = router;