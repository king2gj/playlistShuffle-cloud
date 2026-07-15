import jwt from "jsonwebtoken";

export default function requireAuth(req, res) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return null;
    }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return null;
    }
}