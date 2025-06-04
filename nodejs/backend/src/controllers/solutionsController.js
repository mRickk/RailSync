import Solution from "../models/solutionModel.js";
import Train from "../models/trainModel.js";

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
            for (const sol of solutions) {
                for (const node of sol.solution.nodes) {
                    if (node.train && node.train.acronym && node.train.name) {
                        const trainId = node.train.acronym + node.train.name;
                        const existingTrain = await Train.findOne({ train_id: trainId }).exec();
                        if (!existingTrain) {
                            const trainCode = node.train.name;
                            // const resTrainId = await fetch(`http://www.viaggiatreno.it/infomobilitamobile/resteasy/viaggiatreno/cercaNumeroTreno/${trainCode}`, {
                            //     method: "GET",
                            //     headers: {
                            //         "Accept": "application/json"
                            //     }
                            // });
                            // const codLocOrig = (await resTrainId.json()).codLocOrig;
                            const codLocOrig = node.bdoOrigin;
                            const departureDate = new Date(node.departureTime);
                            node.millis_departure_date = Date.UTC(
                                departureDate.getUTCFullYear(),
                                departureDate.getUTCMonth(),
                                departureDate.getUTCDate()
                            );
                            const today_millis_departure_date = Date.UTC(
                                new Date().getUTCFullYear(),
                                new Date().getUTCMonth(),
                                new Date().getUTCDate()
                            );
                            const res = await fetch(`http://www.viaggiatreno.it/infomobilitamobile/resteasy/viaggiatreno/tratteCanvas/${codLocOrig}/${trainCode}/${today_millis_departure_date}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "application/json"
                                }
                            });
                            if (!res.ok) {
                                console.warn(`Failed to fetch train data with code=${trainCode}  codLocOrig=${codLocOrig}  today_millis_departure_date=${today_millis_departure_date}`);
                                continue;
                            }
                            const text = await res.text();
                            if (text.trim() === "") {
                                console.warn(`Empty JSON response for train:  code=${trainCode}  codLocOrig=${codLocOrig}  today_millis_departure_date=${today_millis_departure_date}`);
                                console.log("Actual departure date:", departureDate);
                                continue;
                            }
                            const stations = JSON.parse(text);
                            await Train.create({
                                train_id: trainId,
                                denomination: node.train.denomination,
                                code: trainCode,
                                stations: stations.map(station => ({
                                    station_id: station.id,
                                    name: station.stazione
                                }))
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Error while fetching train data:", e);
        }

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
                    origin_id: convertStationId(fromStationId),
                    destination: node.destination,
                    destination_id: convertStationId(toStationId),
                    departure_time: new Date(node.departureTime),
                    arrival_time: new Date(node.arrivalTime),
                    train_id: node.train?.acronym + node.train?.name,
                    millis_departure_date: node.millis_departure_date, //TODO: check
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

function convertStationId(frecceStationId) {
    return "S" + String(frecceStationId).slice(-5);
}

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