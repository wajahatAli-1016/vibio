import { NextResponse } from "next/server";
import { generateUploadUrl } from "@vercel/blob";

export const runtime = "edge";

export async function POST() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "Server missing BLOB_READ_WRITE_TOKEN. Create a Vercel Blob token and set it in your project env.",
        },
        { status: 500 }
      );
    }
    const { url } = await generateUploadUrl();
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate upload URL", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}


