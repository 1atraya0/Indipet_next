import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "role_code", "role_name", "permissions", "status", "location_id", "entity_role"
    ];

    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "permissions") {
          sets.push(`${key} = $${idx++}::jsonb`);
          values.push(JSON.stringify(body[key]));
        } else {
          sets.push(`${key} = $${idx++}`);
          values.push(body[key]);
        }
      }
    }

    if (sets.length === 0) {
      return Response.json({ message: "No valid fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE role_master SET ${sets.join(", ")} WHERE role_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Role not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
