var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var {connection, sessionStore} = require('./js/session_handler');

var jsonParser = bodyParser.json();
app.use(jsonParser);

var port = 8080;

// зарегистрированные пользователи, которые могут быть авторизованы


// создание сессии 
app.use(cookieParser());
app.use(session({
    saveUninitialized: true,
    secret: 'supersecret',
    store: sessionStore,
    cookie: {
        secure: false, // используйте true, если у вас HTTPS
        maxAge: 86400000 // продолжительность жизни cookie
    }
}));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});




app.post('/login', function(req, res){
    var login = req.body.login;
    var password = req.body.password;
    var query = 'SELECT * FROM admins WHERE login = ? AND password = ?';

    connection.execute(query, [login, password], (err, results) => {
        if (err) {
        console.log("Login failed: ", req.body.login)
        return res.status(500).send('Login error');
        }
    
        if (results.length > 0) {
            req.session.login = login; 
            console.log("Login succeeded: ", req.session.login);
            return res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + req.session.login);
        }
    
    
       
});

});







app.get('/logout', function (req, res) {
    req.session.login = '';
    console.log('logged out');
    res.send('logged out!');
});

// ограничение доступа к контенту на основе авторизации 
app.get('/admin', function (req, res) {
    // страница доступна только для админа 
    if (req.session.login == 'admin') {
        console.log(req.session.login + ' requested admin page');
        res.render('admin_page');
    } else {
        res.status(403).send('Access Denied!');
    }

});

app.get('/user', function (req, res) {
    // страница доступна для любого залогиненного пользователя 
    if (req.session.login.length > 0) {
        console.log(req.session.login + ' requested user page');
        res.render('user_page');
    } else {
        res.status(403).send('Access Denied!');
    };
});

app.get('/guest', function (req, res) {
    // страница без ограничения доступа 
    res.render('guest_page');
});

app.listen(port, function () {
    console.log('app running on port ' + port);
})
