import { jwtVerify } from 'jose';
import { JWT_KEY, ISSUER, AUDIENCE } from '../util/constants.js';
import User from '../models/userModel.js';

export const requireAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Missing or invalid Authorization token' });
		}
		const token = authHeader.split(' ')[1];

		const { payload } = await jwtVerify(token, JWT_KEY, {
			issuer: ISSUER,
			audience: AUDIENCE
		});
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Missing or invalid Authorization token' });
	}
};

export const requireAdminOrSelf = (req, res, next) => {
    try {
      const userIdFromToken = req.user.id;
      const userIdToAccess = req.params.userId;
  
      const isAdmin = req.user.is_admin === true;
      const isSameUser = userIdFromToken === userIdToAccess;
  
      if (!isAdmin && !isSameUser) {
        return res.status(403).json({ message: 'Access forbidden: You can not access this user' });
      }
  
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error during authorization: ' + err.message });
    }
  };
  

export const requireAdmin = (req, res, next) => {
    try {
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error during authorization: ' + err.message });
    }
  };
  
export const requireAdminOrReservationOwner = async (req, res, next) => {
  try {
    const userIdFromToken = req.user.id;
    const reservationId = req.params.reservationId;

    const user = await User.findById(userIdFromToken).exec();

    const isAdmin = req.user.is_admin === true;
    const hasReservation = user.reservations.some(reservation => reservation.toString() === reservationId);

    if (!isAdmin && !hasReservation) {
      return res.status(403).json({ message: 'Access forbidden: You can not access this reservation' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error during authorization: ' + err.message });
  }
};