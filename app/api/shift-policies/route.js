import { query, getPool } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    let sql = `SELECT * FROM shift_policy_master WHERE 1=1`;
    const params = [];

    if (locationId) {
      sql += ` AND location_id = $${params.length + 1}`;
      params.push(Number(locationId));
    }
    sql += ` ORDER BY policy_id`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { location_id, policies } = body;

    if (!location_id) {
      return Response.json({ message: "location_id is required." }, { status: 400 });
    }
    if (!Array.isArray(policies) || policies.length === 0) {
      return Response.json({ message: "policies array is required." }, { status: 400 });
    }

    // Get location_code for policy_code generation
    const locResult = await query(
      `SELECT location_code FROM sub_location WHERE location_id = $1`,
      [Number(location_id)]
    );
    if (!locResult.rows[0]) {
      return Response.json({ message: "Location not found." }, { status: 404 });
    }
    const locationCode = locResult.rows[0].location_code;

    // Count existing policies for this location for seq numbering
    const countResult = await query(
      `SELECT COUNT(*) AS cnt FROM shift_policy_master WHERE location_id = $1`,
      [Number(location_id)]
    );
    let seq = Number(countResult.rows[0]?.cnt || 0);

    const created = [];
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      for (const policy of policies) {
        seq++;
        const shiftAbbr = (policy.shift_type || "GEN").substring(0, 3).toUpperCase();
        const policyCode = `${locationCode}-${shiftAbbr}-${String(seq).padStart(2, "0")}`;

        const startTime = policy.shift_start_time || "00:00";
        const endTime = policy.shift_end_time || "00:00";
        const breakMin = Number(policy.break_duration_minutes) || 0;

        // compute total_shift_hours and net_work_hours
        const startParts = startTime.split(":").map(Number);
        const endParts = endTime.split(":").map(Number);
        const startTotal = startParts[0] * 60 + startParts[1];
        const endTotal = endParts[0] * 60 + endParts[1];
        const rawMinutes = endTotal >= startTotal ? endTotal - startTotal : (1440 - startTotal) + endTotal;
        const totalHours = parseFloat(((rawMinutes) / 60).toFixed(2));
        const netHours = parseFloat(((rawMinutes - breakMin) / 60).toFixed(2));

        const result = await client.query(
          `INSERT INTO shift_policy_master (
            policy_code, location_id, policy_name, shift_type, coverage_mode,
            shift_start_time, shift_end_time, total_shift_hours,
            break_duration_minutes, net_work_hours,
            sanctioned_strength, max_leave_per_day, keyholder_required,
            weekly_off_pattern, max_consecutive_days, policy_status,
            primary_keyholder_id, backup_keyholder_id
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
          RETURNING *`,
          [
            policyCode, Number(location_id), policy.policy_name, policy.shift_type,
            policy.coverage_mode || "Standard",
            startTime, endTime, totalHours,
            breakMin, netHours,
            Number(policy.sanctioned_strength) || 1,
            Number(policy.max_leave_per_day) || 1,
            policy.keyholder_required === true || policy.keyholder_required === "true",
            policy.weekly_off_pattern || "Rotational",
            Number(policy.max_consecutive_days) || 6,
            policy.policy_status || "Active",
            policy.primary_keyholder_id ? Number(policy.primary_keyholder_id) : null,
            policy.backup_keyholder_id ? Number(policy.backup_keyholder_id) : null
          ]
        );
        created.push(result.rows[0]);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return Response.json(created, { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
