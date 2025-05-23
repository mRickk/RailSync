import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';

export const search_reservations = async function(req, res) {
	try {
		const query = {};

		if (req.query.origin) query.origin = req.query.origin;
        if (req.query.destination) query.destination = req.query.destination;
        if (req.query.status) query.status = req.query.status;

		const reservations = await Reservation.find(query).exec();

		return res.status(200).json(reservations);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const get_reservation = async function(req, res) {
    try {
        const id = req.params.reservationId;
        const reservation = await Reservation.findById(id).exec();
        
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
		const userId = req.params.userId;

		const user = await User.findById(userId).exec();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const reservationData = req.body;
		const createdReservation = await Reservation.create(reservationData);

		user.reservations.push(createdReservation._id);
		await user.save();

		return res.status(201).json(createdReservation);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const delete_reservation = async function(req, res) {
    try {
        const id = req.params.reservationId;
        const reservation = await Reservation.findOneAndDelete({ _id: id }, null);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        await User.updateOne(
            { reservations: id },
            { $pull: { reservations: id } }
        );
        
        return res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const get_all_user_reservations = async function(req, res) {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).exec();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
        const reservationsId = user.reservations;

		const reservations = await Reservation.find()
			.where('_id')
			.in(reservationsId)
			.exec();
            
        return res.status(200).json(reservations);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}