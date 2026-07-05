import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employee_id");

    let sql = `SELECT r.*, e.first_name, e.last_name, e.employee_code,
                      a.approver_first, a.approver_last
               FROM attendance_regularization r
               JOIN employee_master e ON r.employee_id = e.employee_id
               LEFT JOIN (SELECT employee_id, first_name AS approver_first, last_name AS approver_last FROM employee_master) a
                 ON r.approved_by = a.employee_id
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND r.status = $${params.length + 1}`;
      params.push(status);
    }
    if (employeeId) {
      sql += ` AND r.employee_id = $${params.length + 1}`;
      params.push(Number(employeeId));
    }

    sql += ` ORDER BY r.created_at DESC`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { employee_id, attendance_date, issue_type, description, requested_status, supporting_evidence } = body;

    if (!employee_id || !attendance_date || !issue_type) {
      return Response.json(
        { message: "employee_id, attendance_date, and issue_type are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO attendance_regularization
        (employee_id, attendance_date, issue_type, description, requested_status, supporting_evidence)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        Number(employee_id),
        attendance_date,
        issue_type,
        description || null,
        requested_status || null,
        supporting_evidence || null,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
