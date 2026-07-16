import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "designation_code", "designation_name", "department_id",
      "grade_code", "override_grade_code",
      "is_keyholder_eligible", "is_salesperson_eligible", "status"
    ];

    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "is_keyholder_eligible" || key === "is_salesperson_eligible") {
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
      `UPDATE designation_master SET ${sets.join(", ")} WHERE designation_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Designation not found." }, { status: 404 });
    }

    const updated = result.rows[0];

    const deptResult = await query(
      `SELECT department_name FROM department_master WHERE department_id = $1`,
      [updated.department_id]
    );

    return Response.json({
      ...updated,
      department_name: deptResult.rows[0]?.department_name || null
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const empResult = await query(
      `SELECT COUNT(*) AS cnt FROM employee_master WHERE designation_id = $1`, [Number(id)]
    );
    const result = await query(`DELETE FROM designation_master WHERE designation_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) {
      return Response.json({ message: "Designation not found." }, { status: 404 });
    }
    return Response.json({
      message: "Designation deleted.",
      affected: { employees: Number(empResult.rows[0]?.cnt || 0) }
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
