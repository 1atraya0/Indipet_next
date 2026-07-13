import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowed = ["variant_code","variant_name","policy_id","leave_entitlements","is_default","applicable_to","status"];
    const sets = []; const values = []; let idx = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "leave_entitlements") {
          sets.push(`${key} = $${idx++}::jsonb`); values.push(JSON.stringify(body[key]));
        } else {
          sets.push(`${key} = $${idx++}`); values.push(body[key]);
        }
      }
    }
    if (!sets.length) return Response.json({ message: "No valid fields." }, { status: 400 });
    values.push(Number(id));
    const result = await query(`UPDATE policy_variant SET ${sets.join(", ")} WHERE variant_id = $${idx} RETURNING *`, values);
    if (!result.rows.length) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM policy_variant WHERE variant_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ message: "Variant deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
