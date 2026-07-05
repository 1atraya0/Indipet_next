import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT d.designation_id, d.designation_code, d.designation_name,
        d.department_id, dep.department_name,
        d.grade_code, d.override_grade_code,
        d.is_keyholder_eligible, d.is_salesperson_eligible, d.status
       FROM designation_master d
       LEFT JOIN department_master dep ON d.department_id = dep.department_id
       ORDER BY d.designation_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.designation_name || !body.department_id) {
      return Response.json({
        message: "designation_name and department_id are required."
      }, { status: 400 });
    }

    const maxResult = await query(
      `SELECT COALESCE(MAX(designation_id), 0) + 1 AS next_seq FROM designation_master`
    );
    const nextSeq = String(maxResult.rows[0]?.next_seq || 1).padStart(4, "0");
    const designationCode = body.designation_code || `DGN-${nextSeq}`;

    const result = await query(
      `INSERT INTO designation_master (designation_code, designation_name, department_id,
        grade_code, override_grade_code, is_keyholder_eligible, is_salesperson_eligible, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        designationCode, body.designation_name, Number(body.department_id),
        body.grade_code || null, body.override_grade_code || null,
        body.is_keyholder_eligible === true || body.is_keyholder_eligible === "true" ? true : false,
        body.is_salesperson_eligible === true || body.is_salesperson_eligible === "true" ? true : false,
        body.status || "active"
      ]
    );

    const created = result.rows[0];

    const deptResult = await query(
      `SELECT department_name FROM department_master WHERE department_id = $1`,
      [created.department_id]
    );

    return Response.json({
      ...created,
      department_name: deptResult.rows[0]?.department_name || null
    }, { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
