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
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }

    // Return the thumbnail with proper headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
        'Content-Length': blob.size?.toString() || '',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error serving thumbnail:", error);
    return NextResponse.json({ error: "Failed to serve thumbnail" }, { status: 500 });
  }
}
