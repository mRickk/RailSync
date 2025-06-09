// index.js
import mongoose from 'mongoose';
import app from './app.js';
import seedDatabase from "./src/util/seedDatabase.js";

const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';

const connectWithRetry = (retries = 5, delay = 3000) => {
  mongoose.connect(DB_URI, {
      connectTimeoutMS: 1000,
  })
  .then(async () => {
      console.log('MongoDB Connected');

      if (process.env.SEED_DATABASE === "true") {
          console.log("Started database seeding.");
          await seedDatabase();
      }

      app.listen(PORT, () => {
          console.log('Node API server started on port ' + PORT + '!');
      });
  })
  .catch((err) => {
      console.error(`MongoDB connection failed. Retries left: ${retries}`, err);
      if (retries > 0) {
          setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
          console.error("Could not connect to MongoDB. Exiting.");
          process.exit(1);
      }
  });
};

connectWithRetry();
