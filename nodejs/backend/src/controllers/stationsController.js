import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedStations = null;

export const get_all_stations = (req, res) => {
    if (cachedStations) {
      return res.json(cachedStations);
    }

    const filePath = path.join(__dirname, '..', 'data', 'stations.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Errore nella lettura del file JSON:', err);
        return res.status(500).json({ error: 'Errore nel server' });
      }
  
      try {
        cachedStations = JSON.parse(data);
        res.json(cachedStations);
      } catch (parseErr) {
        console.error('Errore nel parsing del JSON:', parseErr);
        res.status(500).json({ error: 'Formato JSON non valido' });
      }
    });
  };
