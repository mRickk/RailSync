import fetch from 'node-fetch';
import csv from 'csv-parser';

export const get_all_stations = async function(req, res) {
    try {
        const results = [];
        const csvUrl = 'https://gist.githubusercontent.com/MarcoBuster/5a142febd4a2032505f4acd20326146c/raw/252fae1074a2766e9940f31dbb57be556987f8fa/Stazioni%2520italiane.csv';
        
        const response = await fetch(csvUrl);

        if (!response.ok) {
            throw new Error(`Errore nel download del CSV: ${response.statusText}`);
        }

        const stream = response.body;

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv({ separator: ',' }))
                .on('data', (data) => {
                    if (data.long_name) {
                        results.push(data.long_name);
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
