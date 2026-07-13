import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Exception ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { severity, resolved_at } = body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (severity) { updates.push(`severity = $${idx++}`); values.push(severity); }
    if (resolved_at !== undefined) { updates.push(`resolved_at = $${idx++}`); values.push(resolved_at || null); }
    if (severity === "Resolved" && !resolved_at) {
      updates.push(`resolved_at = NOW()`);
    }

    if (updates.length === 0) {
      return Response.json({ message: "No fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE shift_exceptions SET ${updates.join(", ")} WHERE exception_id = $${idx}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Shift exception not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM shift_exceptions WHERE exception_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) {
      return Response.json({ message: "Shift exception not found." }, { status: 404 });
    }
    return Response.json({ message: "Shift exception deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
