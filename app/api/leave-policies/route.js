import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM leave_policy_master ORDER BY policy_year DESC, policy_name");
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.policy_name) {
      return Response.json({ message: "policy_name is required." }, { status: 400 });
    }
    const yearResult = await query(`SELECT COALESCE(MAX(policy_id), 0) + 1 AS next FROM leave_policy_master`);
    const nextSeq = String(yearResult.rows[0].next).padStart(3, "0");
    const policyCode = body.policy_code || `LP-${new Date().getFullYear()}-${nextSeq}`;

    const result = await query(
      `INSERT INTO leave_policy_master (policy_code, policy_name, policy_year,
        effective_from, effective_to, scope, calendar_source, approval_mode,
        simultaneous_leave_block, co_credit_trigger, co_auto_credit,
        co_expiry_days, co_min_hours, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [policyCode, body.policy_name, body.policy_year || new Date().getFullYear(),
       body.effective_from || null, body.effective_to || null,
       body.scope || "company", body.calendar_source || "holiday_calendar",
       body.approval_mode || "HR_ADMIN",
       body.simultaneous_leave_block === true || body.simultaneous_leave_block === "true",
       body.co_credit_trigger || "Attendance",
       body.co_auto_credit === true || body.co_auto_credit === "true",
       body.co_expiry_days || 90, body.co_min_hours || 4,
       body.status || "active"]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
