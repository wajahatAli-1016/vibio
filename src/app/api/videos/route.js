import { connectToDatabase } from "../../lib/db";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const docs = await db
      .collection("videos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    const videos = (docs || []).map((d) => ({
      id: String(d._id),
      title: d.title,
      channel: d.channel,
      thumbnail: d.thumbnail,
      video: d.video,
      createdAt: d.createdAt || d._id?.getTimestamp?.() || null,
    }));
    return Response.json({ videos });
  } catch (err) {
    return Response.json({ error: "Failed to load videos", detail: String(err) }, { status: 500 });
  }
}


