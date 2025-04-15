var conn = new Mongo();
var db = conn.getDB('dbsa');

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
   {"username": "admin", "mail": "admin@mail.com", "password": "###", "first_name": "Mario", "last_name": "Rossi", "is_admin": true, "registration_date": new Date()},
   {"username": "riccardo.mazzi", "mail": "riccardo.mazzi@mail.com", "password": "###", "first_name": "Riccardo", "last_name": "Mazzi", "is_admin": false, "registration_date": new Date()},
   {"username": "nicolas.amadori", "mail": "nicolas.amadori@mail.com", "password": "###", "first_name": "Nicolas", "last_name": "Amadori", "is_admin": false, "registration_date": new Date()},
])


