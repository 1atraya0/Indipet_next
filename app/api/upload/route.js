import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return Response.json({ message: "No file provided." }, { status: 400 });
    }
    if (file.size === 0) {
      return Response.json({ message: "Empty file." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), buffer);

    return Response.json({ url: `/uploads/${name}` });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
