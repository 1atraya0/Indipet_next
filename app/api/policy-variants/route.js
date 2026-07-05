import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT v.*, lp.policy_code, lp.policy_name
       FROM policy_variant v
       LEFT JOIN leave_policy_master lp ON v.policy_id = lp.policy_id
       ORDER BY v.variant_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.variant_name || !body.policy_id) {
      return Response.json({ message: "variant_name and policy_id are required." }, { status: 400 });
    }
    const seqResult = await query(`SELECT COALESCE(MAX(variant_id), 0) + 1 AS next FROM policy_variant`);
    const nextSeq = String(seqResult.rows[0].next).padStart(3, "0");
    const variantCode = body.variant_code || `VRT-${nextSeq}`;

    const result = await query(
      `INSERT INTO policy_variant (policy_id, variant_code, variant_name,
        leave_entitlements, is_default, applicable_to, status)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7) RETURNING *`,
      [Number(body.policy_id), variantCode, body.variant_name,
       body.leave_entitlements ? JSON.stringify(body.leave_entitlements) : "{}",
       body.is_default === true || body.is_default === "true",
       body.applicable_to || "all", body.status || "active"]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
