import { NextResponse } from "next/server";
import { generateUploadUrl } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { url } = await generateUploadUrl();
    return NextResponse.json({ url });
  } catch (err) {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        detail: String(err?.message || err),
        envHasToken: hasToken,
      },
      { status: 500 }
    );
  }
}


