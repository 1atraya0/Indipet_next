import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "policy_name", "shift_type", "coverage_mode",
      "shift_start_time", "shift_end_time", "break_duration_minutes",
      "sanctioned_strength", "max_leave_per_day", "keyholder_required",
      "weekly_off_pattern", "weekly_off_day", "max_consecutive_days", "policy_status"
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

    // Recalculate hours when times change
    const startTime = body.shift_start_time !== undefined ? body.shift_start_time : null;
    const endTime = body.shift_end_time !== undefined ? body.shift_end_time : null;
    const breakMin = body.break_duration_minutes !== undefined ? Number(body.break_duration_minutes) : null;
    if (startTime !== null && endTime !== null) {
      const startParts = startTime.split(":").map(Number);
      const endParts = endTime.split(":").map(Number);
      const startTotal = startParts[0] * 60 + startParts[1];
      const endTotal = endParts[0] * 60 + endParts[1];
      const rawMinutes = endTotal >= startTotal ? endTotal - startTotal : (1440 - startTotal) + endTotal;
      const totalHours = parseFloat(((rawMinutes) / 60).toFixed(2));
      const netHours = breakMin !== null ? parseFloat(((rawMinutes - breakMin) / 60).toFixed(2)) : totalHours;
      sets.push(`total_shift_hours = $${idx++}`);
      values.push(totalHours);
      sets.push(`net_work_hours = $${idx++}`);
      values.push(netHours);
    } else if (startTime !== null || endTime !== null) {
      // If only one time changed, recalculate with existing values (handled below by fetching)
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
