import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var SolutionSchema = new Schema({
    solution_id: { type: String, required: true, unique: true },
    origin: { type: String, required: true, },
    destination: { type: String, required: true },
    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    duration: { type: String, required: true },
    status: { type: String, required: true },
    price_currency: { type: String, required: false },
    price_amount: { type: Number, required: false },
    nodes: [{
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departure_time: { type: Date, required: true },
        arrival_time: { type: Date, required: true },
        train: {
            denomination: { type: String, required: true },
            acronym: { type: String, required: true },
            name: { type: String, required: true }
        }
    }]
});

export default mongoose.model('Solution', SolutionSchema);