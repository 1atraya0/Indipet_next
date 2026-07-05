import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT a.*, lp.policy_code, lp.policy_name, pv.variant_code, pv.variant_name
       FROM policy_assignment a
       LEFT JOIN leave_policy_master lp ON a.policy_id = lp.policy_id
       LEFT JOIN policy_variant pv ON a.variant_id = pv.variant_id
       ORDER BY a.assignment_id`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.policy_id || !body.variant_id || !body.assignment_level) {
      return Response.json({ message: "policy_id, variant_id, and assignment_level are required." }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO policy_assignment (policy_id, variant_id, assignment_level,
        target_location_id, target_department_id, target_designation_id,
        target_gender, target_employee_id, override_direction, override_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [Number(body.policy_id), Number(body.variant_id), body.assignment_level,
       body.target_location_id ? Number(body.target_location_id) : null,
       body.target_department_id ? Number(body.target_department_id) : null,
       body.target_designation_id ? Number(body.target_designation_id) : null,
       body.target_gender || null,
       body.target_employee_id ? Number(body.target_employee_id) : null,
       body.override_direction || null,
       body.override_value ? Number(body.override_value) : null]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
