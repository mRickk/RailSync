var conn = new Mongo();
var db = conn.getDB('dbrs');

db.createCollection('users', function(err, collection) {});
db.createCollection('reservations', function(err, collection) {});
db.createCollection('trains', function(err, collection) {});
db.createCollection('stations', function(err, collection) {});

// try {
//    db.users.deleteMany( { } );
// } catch (e) {
//    print (e);
// }

// var cursor = db.users.find();
// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }

db.users.insertMany([
   {"username": "admin", "email": "admin@mail.com", "password": "$argon2id$v=19$m=19456,t=2,p=1$Rn+8jOCvWFWVTx9l2PWjRQ$cWhlN3kDO1jwPh/0XepZ8uaOMydHWMWgfZM2rnkb8vw", "first_name": "Mario", "last_name": "Rossi", "is_admin": true},
   {"username": "riccardo.mazzi", "email": "riccardo.mazzi@mail.com", "password": "$argon2id$v=19$m=19456,t=2,p=1$IY/F7CpcU0qI0IR7N4Aj5Q$BBpFslCsmcLrMrTXhnAiEMcHx9+Yc2Z8Sk3lM07rV5c", "first_name": "Riccardo", "last_name": "Mazzi", "is_admin": false},
   {"username": "nicolas.amadori", "email": "nicolas.amadori@mail.com", "password": "$argon2id$v=19$m=19456,t=2,p=1$uYk2gEZVa54+bL04G5L+hQ$AoAwh0Tn3ROWNSsPh3VLX0Ntmjyfyfe1jn+GXGfWPKs", "first_name": "Nicolas", "last_name": "Amadori", "is_admin": false},
])

db.reservations.insertMany([
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
     reservation_date: new Date("2025-05-10T12:00:00Z"),
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
     reservation_date: new Date("2025-05-11T08:45:00Z"),
   },
   {
     solution_id: "SOL003",
     origin: "Turin",
     destination: "Venice",
     departure_time: new Date("2025-06-03T07:00:00Z"),
     arrival_time: new Date("2025-06-03T10:45:00Z"),
     duration: "3h 45m",
     status: "Cancelled",
     price_currency: "EUR",
     price_amount: 35.00,
     reservation_date: new Date("2025-05-12T09:15:00Z"),
   }
 ])
