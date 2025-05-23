export const get_all_stations = async (req, res) => {
  const name = req.query.name || "\\";
  try {
    //Limite impostato in modo da restituire sempre tutte le stazioni possibili
    const response = await fetch(`https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=${encodeURIComponent(name)}&limit=100000`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};