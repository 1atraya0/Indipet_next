import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM leave_type_master ORDER BY leave_code");
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.leave_code || !body.leave_name) {
      return Response.json({ message: "leave_code and leave_name are required." }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO leave_type_master (leave_code, leave_name, is_paid, pay_percentage,
        accrual_type, max_days_per_year, carry_forward_allowed, gender_restriction,
        requires_approval, is_lop, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [body.leave_code, body.leave_name,
       body.is_paid === true || body.is_paid === "true",
       body.pay_percentage || 0, body.accrual_type || null,
       body.max_days_per_year || 0,
       body.carry_forward_allowed === true || body.carry_forward_allowed === "true",
       body.gender_restriction || "all",
       body.requires_approval === true || body.requires_approval === "true",
       body.is_lop === true || body.is_lop === "true",
       body.status || "active"]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
