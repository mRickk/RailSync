import Reservation from '../models/reservationModel.js';

export const get_all_reservations = async function(req, res) {
    try {
        const user = req.body
        const reservations_id = user.reservations;
        const reservations = await Reservation.find({})
            .where('_id')
            .in(reservations_id);
        return res.json(reservations);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

export const get_reservation = async function(req, res) {
    try {
        const id = req.params.id;
        const reservation = await Reservation.findOne({ _id: id }).exec();
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        return res.status(200).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const create_reservation = async function(req, res) {
    try {
        const reservation = req.body;
        const createdReservation = await Reservation.create(reservation);
        return res.status(201).json(createdReservation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_reservation = async function(req, res) {
    try {
        const id = req.params.id;
        const reservation = await Reservation.findOneAndDelete({ _id: id }, null);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        return res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}