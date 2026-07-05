import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT state_code, state_name FROM state_master ORDER BY state_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
