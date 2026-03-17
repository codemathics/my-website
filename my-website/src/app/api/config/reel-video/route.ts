import { NextResponse } from "next/server";

const DEFAULT_URL =
  "https://pub-4873d59bfaeb4c9a989299dc8a78df82.r2.dev/main.mp4";

export async function GET() {
  const url = (
    process.env.PROJECT_VIDEO_URL ||
    process.env.NEXT_PUBLIC_PROJECT_VIDEO_URL ||
    ""
  ).trim();
  return NextResponse.json({ url: url || DEFAULT_URL });
}
