import sql from "../_lib/db";
import requireAuth from "../_lib/requireAuth";

export default async function handler(req, res) {
    const decoded = requireAuth(req, res);
    if (!decoded) return undefined;

    if (req.method === 'GET') {
        const rows = await sql`
            SELECT playlist_id, playlist_name, playlist_image, 
                   playlist_etag, current_index, shuffled_video_ids
            FROM playlists WHERE user_id = ${decoded.userId}
        `;
        return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
        const {
            playlistId, playlistName, playlistImage, playlistEtag, shuffledVideoIds,
        } = req.body;
        await sql`
            INSERT INTO playlists
                (user_id, playlist_id, playlist_name, playlist_image, playlist_etag, shuffled_video_ids)
            VALUES
                (${decoded.userId}, ${playlistId}, ${playlistName}, ${playlistImage}, ${playlistEtag}, ${shuffledVideoIds})
            ON CONFLICT (user_id, playlist_id) DO UPDATE SET
                shuffled_video_ids = EXCLUDED.shuffled_video_ids,
                updated_at = NOW()
        `;
        return res.status(201).json({ ok: true });
    }

    return res.status(405).end();
}