import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/db";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

function sanitizeFilename(name) {
  return String(name || "file").replace(/[^a-z0-9.\-_]/gi, "_");
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // JSON path: expects direct-to-storage URLs (preferred on Vercel)
    if (contentType.includes("application/json")) {
      const { title, channelName, videoUrl, thumbnailUrl } = await request.json();
      if (!title || !channelName || !videoUrl || !thumbnailUrl) {
        return NextResponse.json(
          { error: "Missing required fields: title, channelName, videoUrl, thumbnailUrl" },
          { status: 400 }
        );
      }
      const { db } = await connectToDatabase();
      await db.collection("videos").insertOne({
        title,
        channel: channelName,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        createdAt: new Date(),
      });
      return NextResponse.json({
        message: "Video saved successfully",
        video: { title, channel: channelName, thumbnail: thumbnailUrl, video: videoUrl },
      });
    }

    // Fallback form-data path: saves to local filesystem (works locally for small files)
    const form = await request.formData();
    const title = form.get("title");
    const channelName = form.get("channelName") || form.get("channel");
    const videoFile = form.get("video");
    const thumbnailFile = form.get("thumbnail");

    if (!title || !channelName || !videoFile || !thumbnailFile) {
      return NextResponse.json(
        { error: "Missing required fields: title, channelName, video, thumbnail" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const videoFilename = `${Date.now()}-${sanitizeFilename(videoFile.name)}`;
    const thumbFilename = `${Date.now()}-${sanitizeFilename(thumbnailFile.name)}`;

    const videoArrayBuffer = await videoFile.arrayBuffer();
    const thumbArrayBuffer = await thumbnailFile.arrayBuffer();

    await fs.writeFile(path.join(uploadsDir, videoFilename), Buffer.from(videoArrayBuffer));
    await fs.writeFile(path.join(uploadsDir, thumbFilename), Buffer.from(thumbArrayBuffer));

    const videoPath = `/uploads/${videoFilename}`;
    const thumbnailPath = `/uploads/${thumbFilename}`;

    const { db } = await connectToDatabase();
    await db.collection("videos").insertOne({
      title,
      channel: channelName,
      thumbnail: thumbnailPath,
      video: videoPath,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Video uploaded successfully",
      video: { title, channel: channelName, thumbnail: thumbnailPath, video: videoPath },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 }
    );
  }
}


