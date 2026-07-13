import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowed = ["leave_code","leave_name","is_paid","pay_percentage","accrual_type","max_days_per_year","carry_forward_allowed","gender_restriction","requires_approval","is_lop","status"];
    const sets = []; const values = []; let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) { sets.push(`${key} = $${idx++}`); values.push(body[key]); }
    }
    if (!sets.length) return Response.json({ message: "No valid fields." }, { status: 400 });
    values.push(Number(id));
    const result = await query(`UPDATE leave_type_master SET ${sets.join(", ")} WHERE leave_type_id = $${idx} RETURNING *`, values);
    if (!result.rows.length) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM leave_type_master WHERE leave_type_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ message: "Leave type deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
