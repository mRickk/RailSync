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
   {"username": "admin", "email": "admin@mail.com", "password": "###", "first_name": "Mario", "last_name": "Rossi", "is_admin": true},
   {"username": "riccardo.mazzi", "email": "riccardo.mazzi@mail.com", "password": "###", "first_name": "Riccardo", "last_name": "Mazzi"},
   {"username": "nicolas.amadori", "email": "nicolas.amadori@mail.com", "password": "###", "first_name": "Nicolas", "last_name": "Amadori"},
])


