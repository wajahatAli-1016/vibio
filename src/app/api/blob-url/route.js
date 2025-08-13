import { NextResponse } from "next/server";
import { generateUploadUrl } from "@vercel/blob";

export const runtime = "edge";

export async function POST() {
  const { url } = await generateUploadUrl();
  return NextResponse.json({ url });
}


