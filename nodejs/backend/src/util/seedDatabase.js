
import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';

const seedReservations = async () => {
  const count = await Reservation.countDocuments();
  if (count > 0) {
    console.log("Reservations already present, skipping seeding.");
    return;
  }

  const seedData = [
    {
      solution_id: "SOL001",
      origin: "Rome",
      destination: "Milan",
      departure_time: new Date("2025-06-01T08:00:00Z"),
      arrival_time: new Date("2025-06-01T11:00:00Z"),
      duration: "3h",
      status: "Confirmed",
      price_currency: "EUR",
      price_amount: 49.99,
    },
    {
      solution_id: "SOL002",
      origin: "Naples",
      destination: "Florence",
      departure_time: new Date("2025-06-02T09:30:00Z"),
      arrival_time: new Date("2025-06-02T12:00:00Z"),
      duration: "2h 30m",
      status: "Pending",
      price_currency: "EUR",
      price_amount: 29.50,
    },
  ];

  const reservations = await Reservation.insertMany(seedData);
  console.log("Seeded reservations.");
  return reservations;
};

const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log("Users already present, skipping seeding.");
    return;
  }

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

  await User.insertMany(seedUsers);
  console.log("Seeded users.");
};

const seedDatabase = async () => {
  await seedUsers();
  const reservations = await seedReservations();

  if (reservations && reservations.length > 0) {
    const nicolas = await User.findOne({ username: "nicolas.amadori" });
    if (nicolas) {
      nicolas.reservations = reservations.map(r => r._id);
      await nicolas.save();
      console.log("Linked reservations to Nicolas.");
    }
  }
};

export default seedDatabase;
