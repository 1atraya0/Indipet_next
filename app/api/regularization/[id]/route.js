import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Request ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { status, approved_by } = body;

    if (!status) {
      return Response.json({ message: "status is required." }, { status: 400 });
    }

    const updates = [`status = $1`, `updated_at = NOW()`];
    const values = [status];
    let idx = 2;

    if (approved_by) {
      updates.push(`approved_by = $${idx++}`);
      values.push(Number(approved_by));
    }
    if (status === "Approved") {
      updates.push(`approved_at = NOW()`);
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE attendance_regularization SET ${updates.join(", ")} WHERE request_id = $${idx}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Regularization request not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`DELETE FROM attendance_regularization WHERE request_id = $1 RETURNING *`, [Number(id)]);
    if (result.rows.length === 0) {
      return Response.json({ message: "Regularization request not found." }, { status: 404 });
    }
    return Response.json({ message: "Regularization request deleted.", record: result.rows[0] });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
