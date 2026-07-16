import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "department_code", "department_name", "department_short_code",
      "revenue_centre_code", "is_revenue_generating", "status"
    ];

    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "is_revenue_generating") {
          sets.push(`${key} = $${idx++}`);
          values.push(body[key] === true || body[key] === "true" ? true : false);
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
      `UPDATE department_master SET ${sets.join(", ")} WHERE department_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Department not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const empResult = await query(
      `SELECT COUNT(*) AS cnt FROM employee_master WHERE department_id = $1`, [Number(id)]
    );
    const result = await query(`DELETE FROM department_master WHERE department_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) {
      return Response.json({ message: "Department not found." }, { status: 404 });
    }
    return Response.json({
      message: "Department deleted.",
      affected: { employees: Number(empResult.rows[0]?.cnt || 0) }
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
