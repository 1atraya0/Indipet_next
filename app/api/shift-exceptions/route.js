import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const employeeId = searchParams.get("employee_id");

    let sql = `SELECT s.*, e.first_name, e.last_name, e.employee_code,
                      sp.policy_name as shift_name
               FROM shift_exceptions s
               JOIN employee_master e ON s.employee_id = e.employee_id
               LEFT JOIN shift_policy_master sp ON s.shift_id = sp.policy_id
               WHERE 1=1`;
    const params = [];

    if (severity) {
      sql += ` AND s.severity = $${params.length + 1}`;
      params.push(severity);
    }
    if (employeeId) {
      sql += ` AND s.employee_id = $${params.length + 1}`;
      params.push(Number(employeeId));
    }

    sql += ` ORDER BY s.created_at DESC`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { employee_id, exception_date, shift_id, exception_type, severity, expected_in, actual_in, expected_out, actual_out } = body;

    if (!employee_id || !exception_date || !exception_type) {
      return Response.json(
        { message: "employee_id, exception_date, and exception_type are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO shift_exceptions
        (employee_id, exception_date, shift_id, exception_type, severity, expected_in, actual_in, expected_out, actual_out)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        Number(employee_id),
        exception_date,
        shift_id ? Number(shift_id) : null,
        exception_type,
        severity || "Open",
        expected_in || null,
        actual_in || null,
        expected_out || null,
        actual_out || null,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
