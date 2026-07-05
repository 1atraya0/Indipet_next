import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT h.*, sl.location_name, sl.location_code
       FROM holiday_calendar h
       LEFT JOIN sub_location sl ON h.location_id = sl.location_id
       ORDER BY h.calendar_year DESC, h.holiday_date`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.holiday_date || !body.holiday_name) {
      return Response.json({ message: "holiday_date and holiday_name are required." }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO holiday_calendar (holiday_date, holiday_name, state_code,
        location_id, is_closed, co_eligible, calendar_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [body.holiday_date, body.holiday_name,
       body.state_code || "WB",
       body.location_id ? Number(body.location_id) : null,
       body.is_closed === true || body.is_closed === "true",
       body.co_eligible === true || body.co_eligible === "true",
       body.calendar_year || Number(body.holiday_date.slice(0, 4))]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
