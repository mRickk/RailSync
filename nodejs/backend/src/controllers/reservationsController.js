import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';
import Solution from '../models/solutionModel.js';
import Train from '../models/trainModel.js';

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
//         solution.nodes.array.forEach(async node => {
//             const trainId = node.train_id;
//             const millis_departure_date = node.millis_departure_date;
//             const train = await Train.findOne({ train_id: trainId }).exec();
//             if (!train) {
//                 return res.status(404).json({ message: `Train with ID ${trainId} not found` });
//             }
//             const originIndex = train.stations.findIndex(station => station.station_id === node.origin_id);
//             const destinationIndex = train.stations.findIndex(station => station.station_id === node.destination_id);
//             if (originIndex === -1 || destinationIndex === -1) {
//                 return res.status(404).json({ message: `Stations ${node.origin_id} [${node.origin}] or ${node.destination_id} [${node.destination}] not found in train ${trainId}` });
//             }
//             const solutionStations = train.stations.slice(
//                 originIndex,
//                 destinationIndex !== train.stations.length - 1 ? destinationIndex + 1 : destinationIndex
//             ).map(station => station.station_id);
//             const occupiedSeats = await Reservation.where("seats.train_id")
//                 .equals(trainId)
//                 .where("seats.millis_departure_date")
//                 .equals(millis_departure_date)
//                 .exec();
//             occupiedSeats.array.filter(async res => {
//                 const sol = await Solution.findOne({ solution_id: res.solution_id })
//                     .exec();
//                 if (!sol) {
//                     return res.status(404).json({ message: `Solution with ID ${res.solution_id} not found` });
//                 }
//                 const solNode = sol.nodes.find(n => n.train_id === trainId && n.millis_departure_date === millis_departure_date);
//                 return solNode.origin_id in solutionStations && solNode.destination_id in solutionStations;
//             }).map(res => res.seats)
//             .filter(seat => seat.train_id === trainId && seat.millis_departure_date === millis_departure_date)
//             .flat();
//             trainsToOccupiedSeats[trainId] = {
//                 millis_departure_date: millis_departure_date,
//                 occupiedSeats: occupiedSeats.map(seat => seat.seat)
//             };
//         });
//         return res.status(200).json(trainsToOccupiedSeats);
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

export const get_occupied_seats = async function (req, res) {
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
            const { origin_id, destination_id } = node;
            const { train_id, millis_departure_date } = node;

            const train = await Train.findOne({ train_id: train_id }).exec();
            if (!train) {
                return res.status(404).json({ message: `Train with ID ${train_id} not found` });
            }

            const originIndex = train.stations.findIndex(station => station.station_id === origin_id);
            console.log("Origin index:", originIndex);
            const destinationIndex = train.stations.findIndex(station => station.station_id === destination_id);
            console.log("Destination index:", destinationIndex);
            if (originIndex === -1 || destinationIndex === -1) {
                return res.status(404).json({
                    message: `Stations ${origin_id} or ${destination_id} not found in train ${train_id}`
                });
            }

            const solutionStations = train.stations.slice(
                originIndex,
                destinationIndex !== train.stations.length - 1 ? destinationIndex + 1 : destinationIndex
            ).map(station => station.station_id);

            const reservations = await Reservation.find({
                "seats.train_id": train_id,
                "seats.millis_departure_date": millis_departure_date
            }).exec();

            const occupiedSeats = [];

            for (const reservation of reservations) {
                const resSolution = await Solution.findOne({ solution_id: reservation.solution_id }).exec();
                if (!resSolution) continue;

                const resNode = resSolution.nodes.find(n =>
                    n.train_id === train_id &&
                    n.millis_departure_date === millis_departure_date &&
                    solutionStations.includes(n.origin_id) &&
                    solutionStations.includes(n.destination_id)
                );

                if (resNode) {
                    for (const seat of reservation.seats) {
                        if (
                            seat.train_id === train_id &&
                            seat.millis_departure_date === millis_departure_date
                        ) {
                            occupiedSeats.push(seat.seat);
                        }
                    }
                }
            }

            if (!trainsToOccupiedSeats[train_id]) {
                trainsToOccupiedSeats[train_id] = {};
            }
            if (!trainsToOccupiedSeats[train_id][millis_departure_date]) {
                trainsToOccupiedSeats[train_id][millis_departure_date] = occupiedSeats;
            }
        }

        return res.status(200).json(trainsToOccupiedSeats);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
