import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ReservationSchema = new Schema({
    solution_id: { type: String, required: true, },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    seat: { type: String, required: true },
    reservation_date: { type: Date, default: Date.now },
});

export default mongoose.model('Reservation', ReservationSchema);