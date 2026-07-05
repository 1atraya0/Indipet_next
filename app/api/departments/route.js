import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT department_id, department_code, department_name, revenue_centre_code,
        is_revenue_generating, status, department_short_code
       FROM department_master
       ORDER BY department_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.department_name || !body.department_short_code) {
      return Response.json({
        message: "department_name and department_short_code are required."
      }, { status: 400 });
    }

    const shortCode = body.department_short_code.toUpperCase();

    const maxResult = await query(
      `SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(department_code, '^.*?(\\d+)$', '\\1') AS INTEGER)), 0) + 1 AS next_seq
       FROM department_master WHERE department_code LIKE $1`,
      [`${shortCode}-%`]
    );
    const nextSeq = String(maxResult.rows[0]?.next_seq || 1).padStart(3, "0");
    const departmentCode = body.department_code || `${shortCode}-${nextSeq}`;
    const revenueCentreCode = body.revenue_centre_code || `RC-${shortCode}-${nextSeq}`;

    const result = await query(
      `INSERT INTO department_master (department_code, department_name, department_short_code,
        revenue_centre_code, is_revenue_generating, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        departmentCode, body.department_name, shortCode,
        revenueCentreCode,
        body.is_revenue_generating === true || body.is_revenue_generating === "true" ? true : false,
        body.status || "active"
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
