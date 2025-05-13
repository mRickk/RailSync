import User from '../models/userModel.js';

import { hash, verify } from '@node-rs/argon2';
import { SignJWT } from 'jose';
import { TOKEN_EXPIRY, JWT_KEY, ISSUER, AUDIENCE } from '../util/constants.js';

export const search_users = async function(req, res) {
	try {
		const query = {};

		if (req.query.username) query.username = req.query.username;
		if (req.query.email) query.email = req.query.email;
		if (req.query.first_name) query.first_name = req.query.first_name;
		if (req.query.last_name) query.last_name = req.query.last_name;
		if (req.query.is_admin !== undefined) query.is_admin = req.query.is_admin === 'true';

		const users = await User.find(query, '-password').exec();

		return res.status(200).json(users);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const update_user = async function(req, res) {
	try {
		const id = req.params.userId;
		const user = req.body;
		const updatedUser = {};

		if (user.username)  {
			const isUsernameAlreadyPresent = await User.findOne({ username: user.username }).exec();

			if (isUsernameAlreadyPresent) {
				return res.status(409).json({ message: "Username already exists" });
			}
			updatedUser.username = user.username;
		}
		if (user.password) updatedUser.password = await hash(user.password);
		if (user.first_name) updatedUser.first_name = user.first_name;
		if (user.last_name) updatedUser.last_name = user.last_name;
		if (user.is_admin) updatedUser.is_admin = user.is_admin;

		if (Object.keys(updatedUser).length === 0) {
			return res.status(400).json({ message: 'No fields to update are given' });
		}

		const result = await User.updateOne({ _id: id }, updatedUser);
		if (!result || result.matchedCount === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		if (result.modifiedCount === 0) {
			return res.status(200).json({ message: "No changes were made" });
		}

		return res.status(200).json({ message: "User updated successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const authenticate = async function(req, res) {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: "Username and password are required" });
		}

		const token = {};
		const user = await User.findOne({ username: username }).exec();

		if (!user || !await verify(user.password, password)) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const userWithoutPassword = user.toObject();
		delete userWithoutPassword.password;

		token.id = userWithoutPassword._id.toString();
		token.username = userWithoutPassword.username;
		token.email = userWithoutPassword.email;
		token.first_name = userWithoutPassword.first_name;
		token.last_name = userWithoutPassword.last_name;
		token.is_admin = userWithoutPassword.is_admin;
		
		const jwt = await new SignJWT(token) //Token encoding
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setIssuer(ISSUER)
			.setAudience(AUDIENCE)
			.setExpirationTime(TOKEN_EXPIRY)
			.sign(JWT_KEY);
		return res.status(200).json({ "token": jwt });
	} catch (error) {
		return res.status(500).json({ message: 'Error during authentication: ' + error.message });
	}
}

export const get_user = async function(req, res) {
	try {
		const id = req.params.userId;
		const user = await User.findOne({ _id: id }, "-password").exec();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json(user);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const create_user = async function(req, res) {
	try {
		const user = req.body;
		user.is_admin = false;
		user.password = await hash(user.password); //TODO: check se da mettere nel fronted

		const isUsernameAlreadyPresent = await User.findOne({ username: req.body.username }).exec();
		const isEmailAlreadyPresent = await User.findOne({ email: req.body.email }).exec();

		if (isEmailAlreadyPresent) {
			return res.status(409).json({ message: "Email already exists" });
		}
		if (isUsernameAlreadyPresent) {
			return res.status(409).json({ message: "Username already exists" });
		}

		const createdUser = await User.create(user);
		const userWithoutPassword = createdUser.toObject();
		delete userWithoutPassword.password;

		return res.status(201).json(userWithoutPassword);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const delete_user = async function(req, res) {
	try {
		const id = req.params.userId;
		const user = await User.findOneAndDelete({ _id: id }, null);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const add_reservation = async function(req, res) {
	try {
		const id = req.params.userId;
		const reservation = req.body.reservation_id;
		const user = await User.findOneAndUpdate({ _id: id }, { $push: { reservations: reservation } }, { new: true });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json({ message: 'Reservation added successfully' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}