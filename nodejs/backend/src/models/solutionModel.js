import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var SolutionSchema = new Schema({
    solution_id: { type: String, required: true, },
    origin: { type: String, required: true, },
    destination: { type: String, required: true },
    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    duration: { type: String, required: false },
    status: { type: String, required: false },
    price_currency: { type: String, required: false },
    price_amount: { type: Number, required: false },
    nodes: [{
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departure_time: { type: Date, required: true },
        arrival_time: { type: Date, required: true },
        train: {
            denomination: { type: String, required: false },
            acronym: { type: String, required: false },
            name: { type: String, required: false }
        }
    }]
});

export default mongoose.model('Solution', SolutionSchema);