import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "edge";

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Get the blob from Vercel Blob storage
    const blob = await get(filename);
    
    if (!blob) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Return the video with proper headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'video/mp4',
        'Content-Length': blob.size?.toString() || '',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error serving video:", error);
    return NextResponse.json({ error: "Failed to serve video" }, { status: 500 });
  }
}
