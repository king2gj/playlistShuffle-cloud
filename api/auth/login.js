import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
    }
    try {
        const { rows } = await sql`
            SELECT id, password_hash
            FROM users
            WHERE username = ${username}
        `;
        const user = rows[0];
        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.status(201).json({ token, username });
        }
        throw Error;
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
}