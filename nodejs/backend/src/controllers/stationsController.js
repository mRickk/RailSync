import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const get_all_stations = async function(req, res) {
    try {
        const results = [];

        const csvPath = path.join(__dirname, '../data/stations.csv');

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv({ separator: ',' }))
                .on('data', (data) => {
                    if (data.id && data.long_name) {
                        results.push({
                            "id": data.id,
                            "long_name": data.long_name
                        });
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
