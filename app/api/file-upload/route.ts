import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
// app/api/file-upload/route.ts
import { NextRequest, NextResponse } from "next/server";

// initialize once, reuse across invocations
const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const BUCKET = process.env.S3_BUCKET_NAME || "myteramemories"; // e.g. "myteramemories"

// (Optional) explicitly run on Node runtime so we can use Buffer, streams, etc.
// export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // required multipart fields
    const file = form.get("file") as File | null;
    const medSpaId = form.get("medSpaId") as string | null;
    const providerId = form.get("providerId") as string | null;
    const patientId = form.get("patientId") as string | null;

    if (!file || !medSpaId || !providerId || !patientId) {
      return NextResponse.json(
        { error: "Missing one of: file, medSpaId, providerId, patientId" },
        { status: 400 },
      );
    }

    const originalName = file.name.replace(/\s+/g, "_");
    const uniqueSuffix = nanoid();
    const key = [
      "memories",
      medSpaId,
      providerId,
      patientId,
      "file_upload",
      `${originalName}_${uniqueSuffix}`,
    ].join("/");

    // read file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    // --- future retention logic placeholder ---
    // // TODO: attach metadata or kick off lifecycle rule enforcement here
    // const retentionDate = new Date();
    // retentionDate.setFullYear(retentionDate.getFullYear() + 1);
    // metadata["x-amz-expiration-rule"] = retentionDate.toISOString();

    // upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type,
        // ACL: "private"    // files are private by default
      }),
    );

    // your users can fetch via a presigned URL or via CloudFront later;
    // for now we’ll return the public S3 URL pattern (adjust if you use a custom domain)
    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      url,
      key,
      name: file.name,
      type: file.type,
    });

    // const url = `/uploads/${file.name}`;
    // return NextResponse.json({ url, name: file.name, type: file.type });
  } catch (err) {
    console.error("[/api/file-upload] upload error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
