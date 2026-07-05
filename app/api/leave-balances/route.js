import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const policyYear = searchParams.get("policy_year");

    let sql = `SELECT b.*, e.employee_code, e.first_name, e.last_name,
               lt.leave_code, lt.leave_name
               FROM employee_leave_balance b
               LEFT JOIN employee_master e ON b.employee_id = e.employee_id
               LEFT JOIN leave_type_master lt ON b.leave_type_id = lt.leave_type_id`;
    const conditions = []; const values = [];
    if (employeeId) { conditions.push(`b.employee_id = $${values.length + 1}`); values.push(Number(employeeId)); }
    if (policyYear) { conditions.push(`b.policy_year = $${values.length + 1}`); values.push(Number(policyYear)); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY e.first_name, lt.leave_code";

    const result = await query(sql, values);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
