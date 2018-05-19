var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var multer = require('multer');
var upload = multer({dest:'public/uploads/'});

mongoose.connect('mongodb://pipe:hola@ds247569.mlab.com:47569/vigtec');

var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
//var routesImages = require('./routes/images');

// Inicar la aplicación
var app = express();

// Motor de las vistas
app.set('views', path.join(__dirname, 'views')); //carpeta que se encarga de las vistas
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Asignar carpeta estática --> Middleware para Archivos que no cambian
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret', //generar identificadores de sesión único
    saveUninitialized: true, //indica si debe guardar la sesión aunque no esté inicializada
    resave: true //la sesión se vuelve a modificar aunque no haya sido modificada
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());

// Variables globales
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.buscar = req.buscar || null;
  next();
});

app.use('/', routes);
app.use('/', users);
//app.use('/', routesImages);

app.set('port', (process.env.PORT || 3009));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});