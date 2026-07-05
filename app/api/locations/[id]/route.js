import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "location_code", "location_name", "brand_flag", "location_type",
      "address_line1", "city", "pincode", "state", "state_code",
      "latitude", "longitude", "phone", "email", "cost_centre_code",
      "onboarding_status", "status"
    ];

    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (body.area_manager_id !== undefined) {
      const val = body.area_manager_id ? Number(body.area_manager_id) : null;
      sets.push(`area_manager_id = $${idx++}`);
      values.push(val);
    }
    if (body.primary_keyholder_id !== undefined) {
      const val = body.primary_keyholder_id ? Number(body.primary_keyholder_id) : null;
      sets.push(`primary_keyholder_id = $${idx++}`);
      values.push(val);
    }
    if (body.backup_keyholder_id !== undefined) {
      const val = body.backup_keyholder_id ? Number(body.backup_keyholder_id) : null;
      sets.push(`backup_keyholder_id = $${idx++}`);
      values.push(val);
    }
    if (body.parent_entity_id !== undefined) {
      const val = body.parent_entity_id ? Number(body.parent_entity_id) : null;
      sets.push(`parent_entity_id = $${idx++}`);
      values.push(val);
    }

    if (sets.length === 0) {
      return Response.json({ message: "No valid fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE sub_location SET ${sets.join(", ")} WHERE location_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Location not found." }, { status: 404 });
    }

    const updated = result.rows[0];
    const entityInfo = updated.parent_entity_id
      ? await query(
          `SELECT entity_code, legal_name FROM parent_entity WHERE entity_id = $1`,
          [updated.parent_entity_id]
        )
      : null;

    return Response.json({
      ...updated,
      parent_entity_code: entityInfo?.rows[0]?.entity_code || null,
      parent_entity_name: entityInfo?.rows[0]?.legal_name || null,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
