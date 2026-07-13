import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "legal_name", "entity_type", "gstin", "gst_type", "pan_number",
      "cin_number", "phone", "email", "address_line1", "address_line2",
      "city", "pincode", "state", "country", "commission_on_products",
      "commission_on_services", "status", "entity_role"
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

    if (sets.length === 0) {
      return Response.json({ message: "No valid fields to update." }, { status: 400 });
    }

    values.push(id);
    const result = await query(
      `UPDATE parent_entity SET ${sets.join(", ")} WHERE entity_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Entity not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM parent_entity WHERE entity_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) {
      return Response.json({ message: "Entity not found." }, { status: 404 });
    }
    return Response.json({ message: "Entity deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
