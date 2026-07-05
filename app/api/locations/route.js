import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const parentEntityId = searchParams.get("parent_entity_id");

    let sql = `SELECT
      sl.location_id, sl.location_code, sl.parent_entity_id,
      pe.entity_code AS parent_entity_code, pe.legal_name AS parent_entity_name,
      sl.location_name, sl.brand_flag, sl.location_type,
      sl.address_line1, sl.city, sl.pincode, sl.state, sl.state_code,
      sl.latitude, sl.longitude, sl.phone, sl.email,
      sl.cost_centre_code, sl.onboarding_status, sl.status,
      sl.area_manager_id, sl.primary_keyholder_id, sl.backup_keyholder_id
      FROM sub_location sl
      LEFT JOIN parent_entity pe ON sl.parent_entity_id = pe.entity_id
      WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND sl.status = $${params.length + 1}`;
      params.push(status);
    }
    if (parentEntityId) {
      sql += ` AND sl.parent_entity_id = $${params.length + 1}`;
      params.push(Number(parentEntityId));
    }
    sql += ` ORDER BY sl.location_id`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const parentEntityId = body.parent_entity_id
      ? Number(body.parent_entity_id)
      : null;

    let areaManagerId = null;
    if (body.area_manager_id) {
      const empResult = await query(
        `SELECT employee_id FROM employee_master WHERE employee_id = $1`,
        [Number(body.area_manager_id)]
      );
      areaManagerId = empResult.rows[0]?.employee_id || null;
    }

    let primaryKeyholderId = null;
    if (body.primary_keyholder_id) {
      const empResult = await query(
        `SELECT employee_id FROM employee_master WHERE employee_id = $1`,
        [Number(body.primary_keyholder_id)]
      );
      primaryKeyholderId = empResult.rows[0]?.employee_id || null;
    }

    let backupKeyholderId = null;
    if (body.backup_keyholder_id) {
      const empResult = await query(
        `SELECT employee_id FROM employee_master WHERE employee_id = $1`,
        [Number(body.backup_keyholder_id)]
      );
      backupKeyholderId = empResult.rows[0]?.employee_id || null;
    }

    const entityResult = parentEntityId
      ? await query(
          `SELECT entity_code, legal_name FROM parent_entity WHERE entity_id = $1`,
          [parentEntityId]
        )
      : null;
    const entityCode = entityResult?.rows[0]?.entity_code || "NEW";

    const maxCodeResult = await query(
      `SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(location_code, '^.*?(\\d+)$', '\\1') AS INTEGER)), 0) + 1 AS next_seq
       FROM sub_location WHERE location_code LIKE $1`,
      [`${entityCode}-%`]
    );
    const nextSeq = String(maxCodeResult.rows[0]?.next_seq || 1).padStart(4, "0");
    const locationCode = body.location_code || `${entityCode}-${nextSeq}`;

    const cityAbbr = body.city
      ? body.city.substring(0, 3).toUpperCase()
      : "XXX";
    const costCentreCode =
      body.cost_centre_code || `CC-${entityCode}-${cityAbbr}-${nextSeq}`;

    const result = await query(
      `INSERT INTO sub_location (
        location_code, parent_entity_id, location_name, brand_flag,
        location_type, address_line1, city, pincode, state, state_code,
        latitude, longitude, phone, email, cost_centre_code,
        area_manager_id, primary_keyholder_id, backup_keyholder_id,
        onboarding_status, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *`,
      [
        locationCode, parentEntityId, body.location_name, body.brand_flag || null,
        body.location_type, body.address_line1 || null, body.city || null,
        body.pincode || null, body.state || null, body.state_code || null,
        body.latitude ? Number(body.latitude) : null,
        body.longitude ? Number(body.longitude) : null,
        body.phone || null, body.email || null, costCentreCode,
        areaManagerId, primaryKeyholderId, backupKeyholderId,
        body.onboarding_status || "pending", body.status || "active"
      ]
    );

    const created = result.rows[0];

    // --- Insert shift policies if provided ---
    let shiftPolicies = [];
    if (Array.isArray(body.shift_policies) && body.shift_policies.length > 0) {
      const locCode = created.location_code;
      let seq = 0;

      for (const policy of body.shift_policies) {
        seq++;
        const shiftAbbr = (policy.shift_type || "GEN").substring(0, 3).toUpperCase();
        const policyCode = `${locCode}-${shiftAbbr}-${String(seq).padStart(2, "0")}`;

        const startTime = policy.shift_start_time || "00:00";
        const endTime = policy.shift_end_time || "00:00";
        const breakMin = Number(policy.break_duration_minutes) || 0;

        const startParts = startTime.split(":").map(Number);
        const endParts = endTime.split(":").map(Number);
        const startTotal = startParts[0] * 60 + startParts[1];
        const endTotal = endParts[0] * 60 + endParts[1];
        const rawMinutes = endTotal >= startTotal ? endTotal - startTotal : (1440 - startTotal) + endTotal;
        const totalHours = parseFloat(((rawMinutes) / 60).toFixed(2));
        const netHours = parseFloat(((rawMinutes - breakMin) / 60).toFixed(2));

        const spResult = await query(
          `INSERT INTO shift_policy_master (
            policy_code, location_id, policy_name, shift_type, coverage_mode,
            shift_start_time, shift_end_time, total_shift_hours,
            break_duration_minutes, net_work_hours,
            sanctioned_strength, max_leave_per_day, keyholder_required,
            weekly_off_pattern, max_consecutive_days, policy_status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          RETURNING *`,
          [
            policyCode, created.location_id, policy.policy_name, policy.shift_type,
            policy.coverage_mode || "Standard",
            startTime, endTime, totalHours,
            breakMin, netHours,
            Number(policy.sanctioned_strength) || 1,
            Number(policy.max_leave_per_day) || 1,
            policy.keyholder_required === true || policy.keyholder_required === "true",
            policy.weekly_off_pattern || "Rotational",
            Number(policy.max_consecutive_days) || 6,
            policy.policy_status || "Active"
          ]
        );
        shiftPolicies.push(spResult.rows[0]);
      }
    }

    const entityInfo = parentEntityId
      ? await query(
          `SELECT entity_code, legal_name FROM parent_entity WHERE entity_id = $1`,
          [parentEntityId]
        )
      : null;

    return Response.json({
      ...created,
      parent_entity_code: entityInfo?.rows[0]?.entity_code || null,
      parent_entity_name: entityInfo?.rows[0]?.legal_name || null,
      shift_policies: shiftPolicies,
    }, { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
