import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Attendance ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { check_in, check_out, total_hours, status, remarks } = body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (check_in !== undefined) {
      updates.push(`check_in_time = CASE WHEN $${idx} IS NOT NULL THEN attendance_date + $${idx}::time ELSE NULL END`);
      values.push(check_in || null);
      idx++;
    }
    if (check_out !== undefined) {
      updates.push(`check_out_time = CASE WHEN $${idx} IS NOT NULL THEN attendance_date + $${idx}::time ELSE NULL END`);
      values.push(check_out || null);
      idx++;
    }
    if (total_hours !== undefined) { updates.push(`worked_hours = $${idx++}`); values.push(Number(total_hours)); }
    if (status) { updates.push(`final_status = $${idx++}`); values.push(status); }
    if (remarks !== undefined) { updates.push(`remarks = $${idx++}`); values.push(remarks || null); }

    if (updates.length === 0) {
      return Response.json({ message: "No fields to update." }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(Number(id));

    const result = await query(
      `WITH upd AS (
        UPDATE attendance SET ${updates.join(", ")} WHERE attendance_id = $${idx}
        RETURNING *
      )
      SELECT
        upd.attendance_id, upd.employee_id, upd.attendance_date,
        upd.check_in_time::text as check_in, upd.check_out_time::text as check_out,
        upd.worked_hours as total_hours, upd.final_status as status,
        upd.location_id, upd.shift_id, upd.remarks
      FROM upd`,
      values
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Attendance record not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
