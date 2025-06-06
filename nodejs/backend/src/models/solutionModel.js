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
    price_currency: { type: String, required: true },
    price_amount: { type: Number, required: true },
    nodes: [{
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departure_time: { type: Date, required: true },
        arrival_time: { type: Date, required: true },
        train: {
            train_id: { type: String, required: true },
            denomination: { type: String, required: true },
            code: { type: String, required: true },
        }
    }]
});

export default mongoose.model('Solution', SolutionSchema);