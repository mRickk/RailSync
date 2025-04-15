var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username required"]
    },
    mail: {
        type: String,
        required: [true, "Email address required"]
    },
    password: {
        type: String,
        required: [true, "Password required"]
    },
    first_name: {
        type: String,
        required: [true, "First name required"]
    },
    last_name: {
        type: String,
        required: [true, "Last name required"]
    },
    is_admin: {
        type: Boolean,
        required: [true, "Is admin required"]
    },
    registration_date: {
        type: Date,
        required: [true, "Registration date required"]
    }
});

module.exports = mongoose.model('Users', UserSchema);
