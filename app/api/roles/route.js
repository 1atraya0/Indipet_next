import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT role_id, role_code, role_name, permissions, status, location_id
       FROM role_master ORDER BY role_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.role_name) {
      return Response.json({
        message: "role_name is required."
      }, { status: 400 });
    }

    const maxResult = await query(
      `SELECT COALESCE(MAX(role_id), 0) + 1 AS next_seq FROM role_master`
    );
    const nextSeq = String(maxResult.rows[0]?.next_seq || 1).padStart(3, "0");
    const slug = body.role_name
      .toUpperCase()
      .replace(/&/g, "AND")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    const roleCode = body.role_code || `${slug}_RL_${nextSeq}`;

    const permissions = body.permissions || null;

    const result = await query(
      `INSERT INTO role_master (role_code, role_name, permissions, status, location_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        roleCode, body.role_name,
        permissions ? JSON.stringify(permissions) : null,
        body.status || "Active",
        body.location_id ? Number(body.location_id) : null
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
