import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ReservationSchema = new Schema({
    solution_id: { type: String, required: true, },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    seats: [{ 
        seat: {type: String, required: true },
        train_id: { type: String, required: true },
        departure_time: { type: Date, required: true },
        arrival_time: { type: Date, required: true },
    }],
    reservation_date: { type: Date, default: Date.now },
});

export default mongoose.model('Reservation', ReservationSchema);