import { query } from "@/src/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const parentEntityId = Number(id);

    if (isNaN(parentEntityId)) {
      return Response.json({ message: "Invalid parent entity ID." }, { status: 400 });
    }

    const result = await query(
      `SELECT employee_id, employee_code, first_name, last_name
       FROM employee_master
       WHERE parent_entity_id = $1
       ORDER BY first_name, last_name`,
      [parentEntityId]
    );

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
