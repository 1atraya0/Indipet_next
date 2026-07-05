import { query } from "@/src/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Roster ID is required." }, { status: 400 });
    }

    const result = await query(
      `SELECT r.*, sl.location_code, sl.location_name, sl.brand_flag
       FROM rosters r
       JOIN sub_location sl ON r.location_id = sl.location_id
       WHERE r.roster_id = $1`,
      [Number(id)]
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Roster not found." }, { status: 404 });
    }

    const r = result.rows[0];
    const data = typeof r.roster_data === "string" ? JSON.parse(r.roster_data) : (r.roster_data || {});

    return Response.json({
      rosterId: String(r.roster_id),
      location: {
        id: String(r.location_id),
        code: r.location_code,
        name: r.location_name,
        brandFlag: r.brand_flag,
      },
      period: { start: r.start_date, end: r.end_date },
      version: r.version,
      status: r.status,
      filled: r.filled_slots,
      open: r.open_slots,
      conflicts: r.conflicts,
      dates: data.dates || [],
      employees: data.employees || [],
      shifts: data.shifts || [],
      allocation: data.allocation || {},
      coverage: data.coverage || {},
      validation: data.validation || [],
      summary: data.summary || {},
      createdAt: r.created_at,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Roster ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { status, version } = body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (version) {
      updates.push(`version = $${idx++}`);
      values.push(version);
    }

    if (updates.length === 0) {
      return Response.json({ message: "No fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE rosters SET ${updates.join(", ")}, updated_at = NOW() WHERE roster_id = $${idx}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return Response.json({ message: "Roster not found." }, { status: 404 });
    }

    const r = result.rows[0];
    return Response.json({
      rosterId: String(r.roster_id),
      status: r.status,
      version: r.version,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
