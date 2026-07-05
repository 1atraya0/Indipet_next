import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT category_code, category_name, description, status
       FROM employee_category_master
       ORDER BY category_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
