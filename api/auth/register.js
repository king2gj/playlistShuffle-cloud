import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { username, password } = req.body;
    if (!username || !password ) {
        return res.status(400).json({ error: 'username and password required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const { rows } = await sql`
            INSERT INTO users (username, password_hash)
            VALUES (${username}, ${passwordHash})
            RETURNING id
        `;
        const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        return res.status(201).json({ token, username });
    } catch (err) {
        return res.status(409).json({ error: 'Username already taken' });
    }
}