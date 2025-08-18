import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/db";
import path from "path";
import { promises as fs } from "fs";
import { put } from "@vercel/blob";

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

    // Form-data path: in dev saves to local filesystem; in prod uploads to Vercel Blob
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

    // On Vercel, local filesystem is ephemeral/non-writable. Require Blob token there.
    if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "File uploads on Vercel require external storage. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) or switch to another persistent storage.",
        },
        { status: 500 }
      );
    }

    const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    let videoPath;
    let thumbnailPath;

    if (useVercelBlob) {
      const videoFilename = `${Date.now()}-${sanitizeFilename(videoFile.name)}`;
      const thumbFilename = `${Date.now()}-${sanitizeFilename(thumbnailFile.name)}`;

      const [videoPut, thumbPut] = await Promise.all([
        put(videoFilename, videoFile, { access: "public" }),
        put(thumbFilename, thumbnailFile, { access: "public" }),
      ]);

      videoPath = videoPut.url;
      thumbnailPath = thumbPut.url;
    } else {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const videoFilename = `${Date.now()}-${sanitizeFilename(videoFile.name)}`;
      const thumbFilename = `${Date.now()}-${sanitizeFilename(thumbnailFile.name)}`;

      const videoArrayBuffer = await videoFile.arrayBuffer();
      const thumbArrayBuffer = await thumbnailFile.arrayBuffer();

      await fs.writeFile(path.join(uploadsDir, videoFilename), Buffer.from(videoArrayBuffer));
      await fs.writeFile(path.join(uploadsDir, thumbFilename), Buffer.from(thumbArrayBuffer));

      videoPath = `/uploads/${videoFilename}`;
      thumbnailPath = `/uploads/${thumbFilename}`;
    }

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


