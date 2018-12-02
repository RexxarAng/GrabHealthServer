const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const passport = require('passport')
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const config = require("./config/database");
const routes = require("./routes/routes");
const doctor = require("./routes/doctor");
const manager = require("./routes/manager");
const receptionist = require("./routes/receptionist");
const admin = require("./routes/admin");
//const passport = require('passport');

mongoose.connect(config.database, {useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
    console.log("Connected to database " + config.database)
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});


const app = express();

const port = 4560;

app.use(helmet());
app.use(cors());

//Body Parser MiddeWare
//Parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Default route
app.use('/', routes);

//Doctor route
app.use('/doctor', doctor);

//Manager route
app.use('/manager', manager);

//Receptionist route
app.use('/receptionist', receptionist);

//Admin route
app.use('/admin', admin);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//Prevent nosql injection
app.use(mongoSanitize({
    replaceWith: '_'
}));


var http = require('http').Server(app);



app.use((req, res, next) => {
    //set headers to allow cross origin request.
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
});


//Make routes case-sensitive
app.set('Case sensitive routing', true);


//apply to all request

//Index Route
app.get('/', (req, res) => {
    res.send('Invalid endpoint');
})

app.listen(port, () => {
    console.log("Server is running on " + port + " port");
});

// httpApp = https.createServer(options, app)
// .listen(port, function(){
//     console.log('Serving the server at https://localhost:3000:${port}')
//     socket.start(httpApp);
// });