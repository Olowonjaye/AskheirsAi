import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type UploadRequest = {
  attachments: { type: string; name?: string; dataUrl: string }[];
};

export async function POST(req: Request) {
  try {
    const body: UploadRequest = await req.json();
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const results = await Promise.all(
      body.attachments.map(async (att) => {
        const match = att.dataUrl.match(/^data:(.+);base64,(.*)$/);
        if (!match) throw new Error("Invalid dataUrl");
        const mime = match[1];
        const data = match[2];
        const buffer = Buffer.from(data, "base64");

        const ext = mime.split("/")[1] || "bin";
        const safeName = (att.name || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, "_");
        const filename = `${Date.now()}_${safeName}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, buffer);

        // public URL
        const url = `/uploads/${filename}`;
        return { name: att.name || filename, type: mime, url };
      })
    );

    return NextResponse.json({ ok: true, uploads: results });
  } catch (err) {
    console.error("/api/uploads error", err);
    return NextResponse.json({ error: (err as Error).message || "Upload failed" }, { status: 500 });
  }
}
