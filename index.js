var express    = require('express');
var path = require('path');
//parser for data sent to the server
//available through req.body
var bodyParser = require('body-parser');
//cookie parser
var cookieParser = require('cookie-parser');
//library for session
var session = require('express-session');
//mongoose for mongodb
var mongoose=require("mongoose");
//create app with express
var app        = express();         // our app
var expressWs = require('express-ws')(app); // WEB SOCKET
//port num
var port = process.env.PORT || 8080;        

//connect to db
mongoose.connect("mongodb://srajchevski:S121R@ds062339.mlab.com:62339/blog");
//callback model ES6
mongoose.Promise = global.Promise;

app.use('/server/images', express.static(path.join(__dirname, '/server/images')));
app.use(express.static('client'));

//app.use(function()) is used at every request
app.use(bodyParser.json()); // library for parsing json
app.use(bodyParser.urlencoded({ extended: true })); // library for parsing url encoding
app.use(function(req, res, next){
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){ req.text += chunk });
        req.on('end', next);
    } else {
        next();
    }
});
app.use(cookieParser()); //parsanje piškotkov



//app.use(express.static('server/images'));
//http://expressjs-book.com/index.html%3Fp=128.html
app.use(session({secret: "MojeGeslo",saveUninitialized: true,resave: true}));
//now we're able to use req.session to store session data

//example func. executed on every request
app.use(function(req,res,next){
	//check if user is signed in
	var user=req.session.uporabnik;
	console.log('User:' +user);
	
	
	console.log('Request from:' +req.ip);
	//res.set('Content-Type',"UTF-8");
	next();
});

//other domain requests
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //res.header("Access-Control-Allow-Origin", "http://localhost:5555");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT,GET,DELETE,POST");//GET, POST, OPTIONS, PUT, PATCH, DELETE
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});



//our controller address
var user=require('./server/routes/user');
app.use('/user', user);
var review=require('./server/routes/review');
app.use('/review', review);
var stats = require('./server/routes/statistics');
app.use('/statistics', stats);
var location=require('./server/routes/location');
app.use('/location', location);


// LISTEN
// =============================================================================
app.listen(port);
console.log('Server running on: ' + port);