import usersRoutes from "./src/routes/usersRoutes.js";
import reservationsRoutes from "./src/routes/reservationsRoutes.js";
import stationsRoutes from "./src/routes/stationsRoutes.js";
import solutionsRoutes from "./src/routes/solutionsRoutes.js";
import seedDatabase from "./src/util/seedDatabase.js";

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
global.appRoot = path.resolve(__dirname);

// Try connecting to mongodb
const connectWithRetry = (retries = 5, delay = 3000) => {
    mongoose.connect(process.env.DB_URI, {
            connectTimeoutMS: 1000
        })
        .then(async() => {
            console.log('MongoDB Connected');

            if (process.env.SEED_DATABASE && process.env.SEED_DATABASE === "true") {
                console.log("Started database seeding.");
                await seedDatabase();
            }
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
app.use('/api/stations', stationsRoutes);
app.use('/api/solutions', solutionsRoutes);

export default app;