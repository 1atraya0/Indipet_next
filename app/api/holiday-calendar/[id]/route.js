import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowed = ["holiday_date","holiday_name","state_code","location_id","is_closed","co_eligible","calendar_year"];
    const sets = []; const values = []; let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) { sets.push(`${key} = $${idx++}`); values.push(body[key]); }
    }
    if (!sets.length) return Response.json({ message: "No valid fields." }, { status: 400 });
    values.push(Number(id));
    const result = await query(`UPDATE holiday_calendar SET ${sets.join(", ")} WHERE holiday_id = $${idx} RETURNING *`, values);
    if (!result.rows.length) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM holiday_calendar WHERE holiday_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ message: "Holiday deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
