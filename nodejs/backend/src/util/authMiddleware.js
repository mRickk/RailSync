import { jwtVerify } from 'jose';
import { JWT_KEY, ISSUER, AUDIENCE } from '../util/constants.js';

export const requireAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Missing or invalid Authorization header' });
		}
		const token = authHeader.split(' ')[1];

		const { payload } = await jwtVerify(token, JWT_KEY, {
			issuer: ISSUER,
			audience: AUDIENCE
		});
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

export const requireAdminOrSameUserId = (req, res, next) => {
    try {
      const userIdFromToken = req.user.id;
      const userIdToAccess = req.params.id;
  
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
  