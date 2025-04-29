import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ReservationSchema = new Schema({
    solution_id: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true
    },
    departure_time: {
        type: Date,
        required: true
    },
    arrival_time: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    price_currency: {
        type: String,
        required: false
    },
    price_amount: {
        type: String,
        required: false
    },
    reservation_date: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('Reservation', ReservationSchema);