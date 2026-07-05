import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");
    const status = searchParams.get("status");

    let sql = `SELECT r.roster_id, r.location_id, r.start_date, r.end_date, r.version, r.status,
                      r.filled_slots, r.open_slots, r.conflicts, r.keyholder_status, r.created_at,
                      sl.location_code, sl.location_name, sl.brand_flag
               FROM rosters r
               JOIN sub_location sl ON r.location_id = sl.location_id
               WHERE 1=1`;
    const params = [];

    if (locationId) {
      sql += ` AND r.location_id = $${params.length + 1}`;
      params.push(Number(locationId));
    }
    if (status) {
      sql += ` AND r.status = $${params.length + 1}`;
      params.push(status);
    }
    sql += ` ORDER BY r.created_at DESC`;

    const result = await query(sql, params);
    const rows = result.rows.map(r => ({
      rosterId: String(r.roster_id),
      locationId: String(r.location_id),
      locationName: r.brand_flag || r.location_name,
      period: `${formatDate(r.start_date)} \u2013 ${formatDate(r.end_date)}`,
      version: r.version,
      status: r.status,
      filled: r.filled_slots,
      open: r.open_slots,
      conflicts: r.conflicts,
      keyholder: r.keyholder_status || "Configured",
      updated: formatDate(r.created_at),
    }));

    return Response.json(rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { location_id, start_date, end_date, version, status, filled_slots, open_slots, conflicts, keyholder_status, roster_data } = body;

    if (!location_id || !start_date || !end_date) {
      return Response.json(
        { message: "location_id, start_date, and end_date are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO rosters (location_id, start_date, end_date, version, status, filled_slots, open_slots, conflicts, keyholder_status, roster_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        Number(location_id),
        start_date,
        end_date,
        version || "v1",
        status || "Published",
        Number(filled_slots) || 0,
        Number(open_slots) || 0,
        Number(conflicts) || 0,
        keyholder_status || "Configured",
        JSON.stringify(roster_data || {}),
      ]
    );

    const r = result.rows[0];
    return Response.json({
      rosterId: String(r.roster_id),
      locationId: String(r.location_id),
      version: r.version,
      status: r.status,
      filled: r.filled_slots,
      open: r.open_slots,
      conflicts: r.conflicts,
      createdAt: r.created_at,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
