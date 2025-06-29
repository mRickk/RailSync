
import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';
import Solution from '../models/solutionModel.js';

const seedSolutions = async () => {
  const seedData = [
    {
      solution_id: "SOL001",
      origin: "Roma",
      destination: "Milano",
      departure_time: new Date("2025-06-01T08:00:00Z"),
      arrival_time: new Date("2025-06-01T11:00:00Z"),
      duration: "3h",
      status: "Confirmed",
      price_currency: "€",
      price_amount: 49.99,
      nodes: [
        {
          origin: "Roma",
          origin_id: "S0527",
          destination: "Bologna Centrale",
          destination_id: "S0529",
          departure_time: new Date("2025-06-01T08:00:00Z"),
          arrival_time: new Date("2025-06-01T09:30:00Z"),
          train: {
            train_id: "FR3940",
            denomination: "Frecciarossa",
            code: "3940"
          }          
        },
        {
          origin: "Bologna Centrale",
          origin_id: "S0529",
          destination: "Milano",
          destination_id: "S0531",
          departure_time: new Date("2025-06-01T09:45:00Z"),
          arrival_time: new Date("2025-06-01T11:00:00Z"),
          train: {
            train_id: "FR3942",
            denomination: "Frecciarossa",
            code: "3942"
          }
        }
      ]
    },
    {
      solution_id: "SOL002",
      origin: "Napoli",
      destination: "Roma",
      departure_time: new Date("2025-06-02T09:30:00Z"),
      arrival_time: new Date("2025-06-02T12:00:00Z"),
      duration: "2h 30m",
      status: "Pending",
      price_currency: "€",
      price_amount: 29.50,
      nodes: [
        {
          origin: "Napoli",
          origin_id: "S0540",
          destination: "Roma",
          destination_id: "S0527",
          departure_time: new Date("2025-06-02T09:30:00Z"),
          arrival_time: new Date("2025-06-02T10:30:00Z"),
          train: {
            train_id: "FR9400",
            denomination: "Frecciarossa",
            code: "9400"
          }
        }
      ]
    },
  ];

  for (const solution of seedData) {
    await Solution.updateOne(
      { solution_id: solution.solution_id },
      { $set: solution },
      { upsert: true }
    );
  }
  
  console.log("Seeded solutions.");
};

const seedReservations = async () => {
  const seedData = [
    {
      solution_id: "SOL001",
      name: "Nicolas",
      surname: "Amadori",
      seats: [{
        seat: "1A",
        train_id: "FR3940",
        departure_time: new Date("2025-06-01T08:00:00Z"),
        arrival_time: new Date("2025-06-01T09:30:00Z"),
      },
      {
        seat: "1B",
        train_id: "FR3942",
        departure_time: new Date("2025-06-01T09:45:00Z"),
        arrival_time: new Date("2025-06-01T11:00:00Z"),
      }],
    },
    {
      solution_id: "SOL002",
      name: "Riccardo",
      surname: "Mazzi",
      seats: [{
        seat: "2A",
        train_id: "FR9400",
        departure_time: new Date("2025-06-02T09:30:00Z"),
        arrival_time: new Date("2025-06-02T10:30:00Z"),
      }]
    },
  ];

  for (const reservation of seedData) {
    await Reservation.updateOne(
      { solution_id: reservation.solution_id, name: reservation.name, surname: reservation.surname },
      { $set: reservation },
      { upsert: true }
    );
  }

  // Recupero delle prenotazioni appena aggiunte
  const solutionIds = seedData.map(r => r.solution_id);
  const reservations = await Reservation.find({ solution_id: { $in: solutionIds } });

  console.log("Seeded reservations.");
  return reservations;
};

const seedUsers = async () => {
  const seedUsers = [
    {
      username: "admin",
      email: "admin@mail.com",
      password: "$argon2id$v=19$m=19456,t=2,p=1$Rn+8jOCvWFWVTx9l2PWjRQ$cWhlN3kDO1jwPh/0XepZ8uaOMydHWMWgfZM2rnkb8vw",
      first_name: "Mario",
      last_name: "Rossi",
      is_admin: true,
    },
    {
      username: "riccardo.mazzi",
      email: "riccardo.mazzi@mail.com",
      password: "$argon2id$v=19$m=19456,t=2,p=1$IY/F7CpcU0qI0IR7N4Aj5Q$BBpFslCsmcLrMrTXhnAiEMcHx9+Yc2Z8Sk3lM07rV5c",
      first_name: "Riccardo",
      last_name: "Mazzi",
    },
    {
      username: "nicolas.amadori",
      email: "nicolas.amadori@mail.com",
      password: "$argon2id$v=19$m=19456,t=2,p=1$uYk2gEZVa54+bL04G5L+hQ$AoAwh0Tn3ROWNSsPh3VLX0Ntmjyfyfe1jn+GXGfWPKs",
      first_name: "Nicolas",
      last_name: "Amadori",
    },
  ];

  for (const user of seedUsers) {
    await User.updateOne(
      { username: user.username },
      { $set: user },
      { upsert: true }
    );
  }
  console.log("Seeded users.");
};

const seedDatabase = async () => {
  await seedUsers();
  await seedSolutions();
  const reservations = await seedReservations();

  if (reservations && reservations.length > 0) {
    const nicolas = await User.findOne({ username: "nicolas.amadori" });
    if (nicolas) {
      nicolas.reservations = reservations.map(r => r._id);
      await nicolas.save();
    }
  }
};

export default seedDatabase;
