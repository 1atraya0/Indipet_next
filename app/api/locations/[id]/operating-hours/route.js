import { query, getPool } from "@/src/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      `SELECT hours_id, location_id, day_of_week, is_open,
              official_open_time, official_close_time,
              operational_open_time, operational_close_time,
              shift_policy_id
       FROM location_operating_hours
       WHERE location_id = $1
       ORDER BY day_of_week`,
      [Number(id)]
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const locationId = Number(id);
    const body = await request.json();

    if (!Array.isArray(body.records) || body.records.length !== 7) {
      return Response.json(
        { message: "Exactly 7 day records are required." },
        { status: 400 }
      );
    }

    const locationCheck = await query(
      `SELECT location_id FROM sub_location WHERE location_id = $1`,
      [locationId]
    );
    if (locationCheck.rows.length === 0) {
      return Response.json({ message: "Location not found." }, { status: 404 });
    }

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM location_operating_hours WHERE location_id = $1`,
        [locationId]
      );

      const inserted = [];
      for (const record of body.records) {
        const insResult = await client.query(
          `INSERT INTO location_operating_hours
           (location_id, day_of_week, is_open,
            official_open_time, official_close_time,
            operational_open_time, operational_close_time)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING *`,
          [
            locationId,
            record.day_of_week,
            Boolean(record.is_open),
            record.official_open_time || null,
            record.official_close_time || null,
            record.operational_open_time || null,
            record.operational_close_time || null,
          ]
        );
        inserted.push(insResult.rows[0]);
      }

      await client.query("COMMIT");
      return Response.json(inserted);
    } catch (txError) {
      await client.query("ROLLBACK");
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
