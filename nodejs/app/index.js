const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const bodyParser = require('body-parser');
const Users = require('./src/models/userModels')
const mongoUrl = 'mongodb://mongodb:27017/dbsa';


const app = express();

app.use(cors()); // Allows cross-origin requests
// Importing parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const path = require('path');
global.appRoot = path.resolve(__dirname);

// Try connecting to mongodb
const connectWithRetry = (retries = 5, delay = 3000) => {
    mongoose.set('useFindAndModify', false);
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        connectTimeoutMS: 1000
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error(`MongoDB connection unsuccessful, retries left: ${retries}`, err);
        if (retries > 0) {
            setTimeout(() => {
                connectWithRetry(retries - 1, delay);
            }, delay);
        } else {
            console.error('MongoDB connection failed. Exiting.');
            process.exit(1); // exit the app if too many failed attempts
        }
    });
};
connectWithRetry();

var routes = require('./src/routes/routes');
routes(app);

app.listen(3000, function() {
    console.log('Node API server started on port 3000!');
});