import Solution from "../models/solutionModel.js";

export const get_solutions = async function(req, res) {
    const { fromStationId, toStationId, datetime } = req.query;
    if (!fromStationId || !toStationId || !datetime) {
        return res.status(400).json({ message: "Some parameter is missing: fromStationId, toStationId and datetime are required" });
    }

    const payload = {
        "departureLocationId": fromStationId,
        "arrivalLocationId": toStationId,
        "departureTime": datetime,
        "adults": 1,
    };

    try {
        const response = await fetch("https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        // await Solution.insertMany(data.solutions.array.map(solution => ({
        //     solution_id: solution.id,
        //     origin: solution.origin,
        //     destination: solution.destination,
        //     departure_time: new Date(solution.departureTime),
        //     arrival_time: new Date(solution.arrivalTime),
        //     duration: solution.duration,
        //     status: solution.status,
        //     price_currency: solution.price.currency,
        //     price_amount: solution.price.amount,
        //     nodes: solution.nodes.map(node => ({
        //         origin: node.origin,
        //         destination: node.destination,
        //         departure_time: new Date(node.departureTime),
        //         arrival_time: new Date(node.arrivalTime),
        //         train: {
        //             denomination: node.train.denomination,
        //             acronym: node.train.acronym,
        //             name: node.train.name
        //         }
        //     }))
        // })));
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
  };