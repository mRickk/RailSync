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
        const solutions = data.solutions.filter(
            sol => sol.solution.status === "SALEABLE" && sol.solution.price !== null && sol.solution.price.amount !== null && sol.solution.price.amount > 0
        );
        try {
            await Solution.insertMany(solutions.map(sol => ({
                solution_id: sol.solution.origin + "|" + sol.solution.destination + "|" + (new Date(sol.solution.departureTime).toISOString()) + "|" + (new Date(sol.solution.arrivalTime).toISOString()) + "|" + sol.solution.price?.amount,
                origin: sol.solution.origin,
                destination: sol.solution.destination,
                departure_time: new Date(sol.solution.departureTime),
                arrival_time: new Date(sol.solution.arrivalTime),
                duration: sol.solution.duration,
                status: sol.solution.status,
                price_currency: sol.solution.price?.currency,
                price_amount: sol.solution.price?.amount,
                nodes: sol.solution.nodes?.map(node => ({
                    origin: node.origin,
                    destination: node.destination,
                    departure_time: new Date(node.departureTime),
                    arrival_time: new Date(node.arrivalTime),
                    train: {
                        train_id: node.train?.acronym + node.train?.name,
                        denomination: node.train?.denomination,
                        code: node.train?.name,
                    }
                    
                }))
            })), { ordered: false });
        } catch (e) {
            // console.warn("Duplicates skipped:", e);
        }
        return res.status(200).json(solutions);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const get_solution = async function(req, res) {
    const solutionId = req.params.solutionId;
    if (!solutionId) {
        return res.status(400).json({ message: "Solution ID is required" });
    }

    try {
        const solution = await Solution.findOne({ solution_id: solutionId }).exec();
        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }
        return res.status(200).json(solution);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};