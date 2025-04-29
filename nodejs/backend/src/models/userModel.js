import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    registration_date: {
        type: Date,
        default: Date.now
    },
    reservations: {
        type: [Schema.Types.ObjectId],
        ref: 'Reservation',
        default: []
    }
});

export default  mongoose.model('User', UserSchema);