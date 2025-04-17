import users from './src/routes/userRoutes.js';

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const User = require('./src/models/userModel');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const mongoUrl = 'mongodb://mongodb:27017/dbrs';

const app = express();

app.use(cors()); // Allows cross-origin requests
// Importing parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.appRoot = path.resolve(__dirname);

// Try connecting to mongodb
const connectWithRetry = (retries = 5, delay = 3000) => {
    mongoose.connect(mongoUrl, {
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

app.use('/api/users', users);

app.listen(3000, function() {
    console.log('Node API server started on port 3000!');
});