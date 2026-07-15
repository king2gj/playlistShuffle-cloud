import { sql } from '@vercel/postgres';
import requireAuth from '../../_lib/requireAuth';

export default async function handler(req, res) {
    const decoded = requireAuth(req, res);
    if (!decoded) return undefined;
    if (req.method !== 'DELETE') return res.status(405).end();

    const { playlistId } = req.query;
    await sql`
        DELETE FROM playlists WHERE user_id = ${decoded.userId} AND playlist_id = ${playlistId}
    `;
    return res.status(200).json({ ok: true });
}
