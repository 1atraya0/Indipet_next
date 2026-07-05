import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const entryType = searchParams.get("entry_type");

    let sql = `SELECT c.*, e.first_name, e.last_name, e.employee_code
               FROM co_ledger c
               JOIN employee_master e ON c.employee_id = e.employee_id
               WHERE 1=1`;
    const params = [];

    if (employeeId) {
      sql += ` AND c.employee_id = $${params.length + 1}`;
      params.push(Number(employeeId));
    }
    if (entryType) {
      sql += ` AND c.entry_type = $${params.length + 1}`;
      params.push(entryType);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { employee_id, entry_type, units, balance_after, source, attendance_date, expiry_date, remarks } = body;

    if (!employee_id || !entry_type || units === undefined || balance_after === undefined) {
      return Response.json(
        { message: "employee_id, entry_type, units, and balance_after are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO co_ledger
        (employee_id, entry_type, units, balance_after, source, attendance_date, expiry_date, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        Number(employee_id),
        entry_type,
        Number(units),
        Number(balance_after),
        source || null,
        attendance_date || null,
        expiry_date || null,
        remarks || null,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
