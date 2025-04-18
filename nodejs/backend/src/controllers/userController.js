import User from '../models/userModel.js';
import { hash, verify } from '@node-rs/argon2';
import createSecretKey from 'crypto';
import SignJWT from 'jose';

const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_KEY = createSecretKey(process.env.JWT_KEY || "secret_key");
const ISSUER = process.env.JWT_ISSUER || "issuer";
const AUDIENCE = process.env.JWT_AUDIENCE || "audience";

export const get_all_users = async function(req, res) {
	try {
		const users = await User.find({}); //'-_id -__v' Per escludere dei campi dall'output
		res.json(users);
	} catch (err) {
		res.status(500).send(err);
	}
}

export const update_user = async function(req, res) {
	try {
		const id = req.params.id;
		const user = req.body;
		const updatedUser = {};

		if (user.username) updatedUser.username = user.username;
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
		return res.status(404).json({ message: error.message });
	}
}

export const authenticate = async function(req, res) {
	try {
		const { username, password } = req.body;
		const token = {};
		const user = await User.findOne({ username: username }).exec();
		if (!user || !await verify(user.data.password, password)) {
			return res.status(401).send("Invalid credentials");
		}

		token.is_admin = user.is_admin;
		token.username = user.username;
		token.profile = user;
		token.profile.password = undefined;
		const jwt = await new SignJWT(token) //Token encoding
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setIssuer(ISSUER)
			.setAudience(AUDIENCE)
			.setExpirationTime(TOKEN_EXPIRY)
			.sign(JWT_KEY);
		return res.status(200).json({ "token": jwt });
	} catch (error) {
		return res.status(500).send('Error during authentication: ' + error.message);
	}
}

export const get_user = async function(req, res) {
	try {
		const id = req.params.id;
		const user = await User.findOne({ _id: id }).select('-password').exec();
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json(user);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
}

export const create_user = async function(req, res) {
	try {
		const user = req.body;
		user.password = await hash(user.password); //TODO: check se da mettere nel fronted

		const isUsernameAlreadyPresent = await User.findOne({ username: req.body.username }).exec();
		const isEmailAlreadyPresent = await User.findOne({ email: req.body.email }).exec();

		if (isEmailAlreadyPresent) {
			return res.status(409).json({ message: "Email already exists" });
		}
		if (isUsernameAlreadyPresent) {
			return res.status(409).json({ message: "Username already exists" });
		}

		await User.create(user);
		return res.status(201).json({ message: 'User created successfully' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
}

export const delete_user = async function(req, res) {
	try {
		const id = req.params.id;
		const user = await User.findOneAndDelete({ _id: id }, null);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}