import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';
import Solution from '../models/solutionModel.js';

// export const search_reservations = async function(req, res) {
// 	try {
// 		const query = {};

// 		if (req.query.origin) query.origin = req.query.origin;
//         if (req.query.destination) query.destination = req.query.destination;
//         if (req.query.status) query.status = req.query.status;

// 		const reservations = await Reservation.find(query).exec();

// 		return res.status(200).json(reservations);
// 	} catch (error) {
// 		return res.status(500).json({ message: error.message });
// 	}
// }

export const get_reservation = async function(req, res) {
    try {
        const id = req.params.reservationId;
        const reservation = await Reservation.findById(id).exec();
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        const solution = await Solution.findOne({ solution_id: reservation.solution_id }).exec();
        return res.status(200).json({ res: reservation, sol: solution });
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

        await User.updateOne({ reservations: id }, { $pull: { reservations: id } });

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
        const resSol = await Promise.all(reservations.map(async(reservation) => {
            const solution = await Solution.findOne({ solution_id: reservation.solution_id }).exec();
            return { res: reservation, sol: solution };
        }));
        return res.status(200).json(resSol);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

export const get_all_reservations = async function(req, res) {
    try {
        const reservations = await Reservation.find().exec();
        const resSol = await Promise.all(reservations.map(async(reservation) => {
            const solution = await Solution.findOne({ solution_id: reservation.solution_id }).exec();
            return { res: reservation, sol: solution };
        }));
        return res.status(200).json(resSol);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

// export const get_occupied_seats = async function(req, res) {
//     try {
//         const solutionId = req.params.solutionId;
//         if (!solutionId) {
//             return res.status(400).json({ message: "Solution ID is required" });
//         }
//         const solution = await Solution.findOne({ solution_id: solutionId }).exec();
//         if (!solution) {
//             return res.status(404).json({ message: "Solution not found" });
//         }
//         const trainsToOccupiedSeats = {};
//         for (const node of solution.nodes) {
//             const trainId = node.train.train_id;
//             const depTime = new Date(node.departure_time).getTime();
//             const arrTime = new Date(node.arrival_time).getTime();
//             const occupiedSeats = (await Reservation.find({
//                     seats: { $elemMatch: { train_id: trainId } }
//                 }).exec())
//                 .map(res => res.seats)
//                 .filter(s => s.train_id === trainId)
//                 .filter(s => {
//                     const seatDepTime = new Date(s.departure_time).getTime();
//                     const seatArrTime = new Date(s.arrival_time).getTime();
//                     console.log(`seatDepTime: ${seatDepTime}, depTime: ${depTime}, seatArrTime: ${seatArrTime}, arrTime: ${arrTime}`);
//                     return (seatDepTime <= depTime && seatArrTime > depTime) ||
//                         (seatDepTime >= depTime && seatDepTime < arrTime)
//                 });
//             trainsToOccupiedSeats[trainId] = occupiedSeats.flat().map(s => s.seat);
//         }
//         return res.status(200).json(trainsToOccupiedSeats);
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

export const get_occupied_seats = async function(req, res) {
    try {
        const solutionId = req.params.solutionId;
        if (!solutionId) {
            return res.status(400).json({ message: "Solution ID is required" });
        }

        const solution = await Solution.findOne({ solution_id: solutionId }).exec();
        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }

        const trainsToOccupiedSeats = {};

        for (const node of solution.nodes) {
            const trainId = node.train.train_id;
            const depTime = new Date(node.departure_time).getTime();
            const arrTime = new Date(node.arrival_time).getTime();

            const reservations = await Reservation.find({
                seats: { $elemMatch: { train_id: trainId } }
            }).exec();

            const occupiedSeats = reservations
                .flatMap(res => res.seats)
                .filter(seat => seat.train_id === trainId)
                .filter(seat => {
                    const seatDepTime = new Date(seat.departure_time).getTime();
                    const seatArrTime = new Date(seat.arrival_time).getTime();
                    return (
                        (seatDepTime <= depTime && seatArrTime > depTime) ||
                        (seatDepTime >= depTime && seatDepTime < arrTime)
                    );
                })
                .map(seat => seat.seat);

            trainsToOccupiedSeats[trainId] = occupiedSeats;
        }

        return res.status(200).json(trainsToOccupiedSeats);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
