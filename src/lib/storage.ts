import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const getS3Client = () => {
  return new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT || "",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "",
      secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
  });
};

export async function uploadImage(buffer: Buffer, key: string): Promise<string> {
  const s3Client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "dreamola-art",
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command);
  
  // Return the public URL
  const publicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "https://pub-6524ef51842b420cb5f6f462f0732ac3.r2.dev";
  return `${publicUrl}/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  const s3Client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "dreamola-art",
    Key: key,
  });

  await s3Client.send(command);
}
