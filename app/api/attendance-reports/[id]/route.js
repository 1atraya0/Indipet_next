import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Report ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { report_name, scope, scope_value, period_start, period_end, filters } = body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (report_name) { updates.push(`report_name = $${idx++}`); values.push(report_name); }
    if (scope !== undefined) { updates.push(`scope = $${idx++}`); values.push(scope || null); }
    if (scope_value !== undefined) { updates.push(`scope_value = $${idx++}`); values.push(scope_value ? Number(scope_value) : null); }
    if (period_start !== undefined) { updates.push(`period_start = $${idx++}`); values.push(period_start || null); }
    if (period_end !== undefined) { updates.push(`period_end = $${idx++}`); values.push(period_end || null); }
    if (filters) { updates.push(`filters = $${idx++}`); values.push(JSON.stringify(filters)); }

    if (updates.length === 0) {
      return Response.json({ message: "No fields to update." }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(Number(id));

    const result = await query(
      `UPDATE attendance_reports SET ${updates.join(", ")} WHERE report_id = $${idx}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Report not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM attendance_reports WHERE report_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ message: "Report deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
