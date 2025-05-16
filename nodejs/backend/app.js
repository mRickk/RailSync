import usersRoutes from "./src/routes/userRoutes.js";
import reservationsRoutes from "./src/routes/reservationRoutes.js";
import seedDatabase from "./src/util/seedDatabase.js";

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const mongoUrl = 'mongodb://mongodb:27017/dbrs';

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Allows cross-origin requests
app.options('*', cors(corsOptions));
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
        .then(async () => {
            console.log('MongoDB Connected');
            await seedDatabase();
        })
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
  
app.use('/api/users', usersRoutes);
app.use('/api/reservations', reservationsRoutes);

// Export the app for testing purposes
export default app;