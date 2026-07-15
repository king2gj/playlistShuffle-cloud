import sql from '../../../_lib/db';
import requireAuth from '../../../_lib/requireAuth';

export default async function handler(req, res) {
    const decoded = requireAuth(req, res);
    if (!decoded) return undefined;
    if (req.method !== 'PATCH') return res.status(405).end();

    const { playlistId } = req.query;
    const { currentIndex } = req.body;
    await sql`
        UPDATE playlists SET current_index = ${currentIndex}, updated_at = NOW()
        WHERE user_id = ${decoded.userId} AND playlist_id = ${playlistId}
    `;
    return res.status(200).json({ ok: true });
}
