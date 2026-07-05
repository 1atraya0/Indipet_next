import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT r.*, e.first_name, e.last_name
       FROM attendance_reports r
       LEFT JOIN employee_master e ON r.owner_id = e.employee_id
       ORDER BY r.created_at DESC`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { report_name, scope, scope_value, period_start, period_end, filters, owner_id } = body;

    if (!report_name) {
      return Response.json({ message: "report_name is required." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO attendance_reports
        (report_name, scope, scope_value, period_start, period_end, filters, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        report_name,
        scope || null,
        scope_value ? Number(scope_value) : null,
        period_start || null,
        period_end || null,
        JSON.stringify(filters || {}),
        owner_id ? Number(owner_id) : null,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
