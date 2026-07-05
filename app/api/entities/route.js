import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let sql = `SELECT entity_id, entity_code, legal_name, entity_type, gstin, gst_type,
      pan_number, cin_number, phone, email, address_line1, address_line2,
      city, pincode, state, country, commission_on_products, commission_on_services,
      status, entity_role
      FROM parent_entity WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    sql += ` ORDER BY legal_name`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      entity_code, legal_name, entity_type, gstin, gst_type,
      pan_number, cin_number, phone, email, address_line1, address_line2,
      city, pincode, state, country, commission_on_products, commission_on_services,
      status, entity_role
    } = body;

    const result = await query(
      `INSERT INTO parent_entity (entity_code, legal_name, entity_type, gstin, gst_type,
        pan_number, cin_number, phone, email, address_line1, address_line2,
        city, pincode, state, country, commission_on_products, commission_on_services,
        status, entity_role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [entity_code, legal_name, entity_type, gstin, gst_type,
        pan_number, cin_number, phone, email, address_line1, address_line2,
        city, pincode, state, country,
        commission_on_products ?? 0, commission_on_services ?? 0,
        status || "active", entity_role]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
