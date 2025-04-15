const mongoose = require('mongoose');
const Users = mongoose.model('Users');

exports.get_index = function(req, res) {
  res.sendFile(appRoot  + '/www/index.html');
}

// exports.get_all_users = function(req, res) {
// 	Users.find({}, '-_id -__v', function(err, users) {
// 		if (err) {
// 			res.status(500).send(err);
// 		} else {
// 			res.json(users);
// 		}
// 	});
// };

exports.get_all_users = async function(req, res) {
	try {
		const users = await Users.find({}, '-_id -__v');
		res.json(users);
	} catch (err) {
		res.status(500).send(err);
	}
};


