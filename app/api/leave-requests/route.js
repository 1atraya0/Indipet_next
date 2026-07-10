import { query } from "@/src/lib/db";

const safeNumber = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function GET() {
  try {
    const result = await query(
      `SELECT r.*, e.employee_code, e.first_name, e.last_name,
        lt.leave_code, lt.leave_name
       FROM leave_requests r
       LEFT JOIN employee_master e ON r.employee_id = e.employee_id
       LEFT JOIN leave_type_master lt ON r.leave_type_id = lt.leave_type_id
       ORDER BY r.applied_on DESC`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.employee_id || !body.leave_type_id || !body.start_date || !body.end_date) {
      return Response.json({ message: "employee_id, leave_type_id, start_date, and end_date are required." }, { status: 400 });
    }
    const start = new Date(body.start_date);
    const end = new Date(body.end_date);
    const duration = body.duration_days || Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const empId = safeNumber(body.employee_id);
    const ltId = safeNumber(body.leave_type_id);
    const approvedBy = safeNumber(body.approved_by);

    if (empId === null || ltId === null) {
      return Response.json({ message: "Invalid employee_id or leave_type_id." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date,
        duration_days, reason, status, applied_on, approved_by, approved_on, period)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE,$8,$9,$10) RETURNING *`,
      [empId, ltId,
       body.start_date, body.end_date, duration,
       body.reason || null, body.status || "pending",
       approvedBy,
       body.approved_on || null, body.period || null]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
