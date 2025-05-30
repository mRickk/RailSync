import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var TrainSchema = new Schema({
    train_id: { type: String, required: true, unique: true },
    denomination: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    stations: [{
        station_id: { type: String, required: true },
        name: { type: String, required: true },
        millisDepartureDate: { type: Number, required: true},
    }]
});

export default mongoose.model('Train', TrainSchema);
