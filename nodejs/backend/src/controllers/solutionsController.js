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

        try {
            await Solution.insertMany(data.solutions.map(solution => ({
                solution_id: solution.solution.origin + "|" + solution.solution.destination + "|" + (new Date(solution.solution.departureTime).toISOString()) + "|" + (new Date(solution.solution.arrivalTime).toISOString()),
                origin: solution.solution.origin,
                destination: solution.solution.destination,
                departure_time: new Date(solution.solution.departureTime),
                arrival_time: new Date(solution.solution.arrivalTime),
                duration: solution.solution.duration,
                status: solution.solution.status,
                price_currency: solution.solution.price?.currency,
                price_amount: solution.solution.price?.amount,
                nodes: solution.solution.nodes?.map(node => ({
                    origin: node.origin,
                    destination: node.destination,
                    departure_time: new Date(node.departureTime),
                    arrival_time: new Date(node.arrivalTime),
                    train: {
                        denomination: node.train?.denomination,
                        acronym: node.train?.acronym,
                        name: node.train?.name
                    }
                }))
            })), { ordered: false });
        } catch (e) {
            // console.warn("Duplicates skipped:", e.writeErrors);
        }
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};