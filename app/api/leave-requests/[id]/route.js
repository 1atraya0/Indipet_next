import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.status !== undefined) body.status = String(body.status).toLowerCase();
    if (body.status === "approved" && body.approved_on === undefined) {
      body.approved_on = new Date().toISOString().slice(0, 10);
    }
    const allowed = ["status","approved_by","approved_on","reason","period","start_date","end_date","duration_days","leave_type_id"];
    const sets = []; const values = []; let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) { sets.push(`${key} = $${idx++}`); values.push(body[key]); }
    }
    sets.push(`updated_at = now()`);
    if (sets.length <= 1) return Response.json({ message: "No valid fields." }, { status: 400 });
    values.push(Number(id));
    const result = await query(`UPDATE leave_requests SET ${sets.join(", ")} WHERE request_id = $${idx} RETURNING *`, values);
    if (!result.rows.length) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM leave_requests WHERE request_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ message: "Leave request deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
