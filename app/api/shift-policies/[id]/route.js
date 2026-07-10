import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "policy_name", "shift_type", "coverage_mode",
      "shift_start_time", "shift_end_time", "break_duration_minutes",
      "sanctioned_strength", "max_leave_per_day", "keyholder_required",
      "weekly_off_pattern", "max_consecutive_days", "policy_status"
    ];

    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (body.primary_keyholder_id !== undefined) {
      const val = body.primary_keyholder_id ? Number(body.primary_keyholder_id) : null;
      sets.push(`primary_keyholder_id = $${idx++}`);
      values.push(val);
    }
    if (body.backup_keyholder_id !== undefined) {
      const val = body.backup_keyholder_id ? Number(body.backup_keyholder_id) : null;
      sets.push(`backup_keyholder_id = $${idx++}`);
      values.push(val);
    }

    if (sets.length === 0) {
      return Response.json({ message: "No valid fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE shift_policy_master SET ${sets.join(", ")} WHERE policy_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Shift policy not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      `DELETE FROM shift_policy_master WHERE policy_id = $1 RETURNING *`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Shift policy not found." }, { status: 404 });
    }

    return Response.json({ message: "Shift policy deleted.", policy: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
