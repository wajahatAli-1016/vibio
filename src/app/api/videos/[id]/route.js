import { connectToDatabase } from "../../../lib/db";
import { ObjectId } from "mongodb";

export async function GET(_request, { params }) {
  try {
    const { id } = params || {};
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    let objectId;
    try {
      objectId = new ObjectId(String(id));
    } catch {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection("videos").findOne({ _id: objectId });
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const video = {
      id: String(doc._id),
      title: doc.title,
      channel: doc.channel,
      thumbnail: doc.thumbnail,
      video: doc.video,
      createdAt: doc.createdAt || doc._id?.getTimestamp?.() || null,
    };
    return Response.json({ video });
  } catch (err) {
    return Response.json({ error: "Failed to load video", detail: String(err) }, { status: 500 });
  }
}


