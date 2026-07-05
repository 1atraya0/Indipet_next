import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const locationId = searchParams.get("location_id");
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employee_id");

    let sql = `SELECT
                 a.attendance_id, a.employee_id, a.attendance_date,
                 a.check_in_time::text as check_in, a.check_out_time::text as check_out,
                 a.worked_hours as total_hours, a.final_status as status,
                 a.location_id, a.shift_id, a.remarks,
                 e.first_name, e.last_name, e.employee_code,
                 sl.location_name, sp.policy_name as shift_name
               FROM attendance a
               JOIN employee_master e ON a.employee_id = e.employee_id
               LEFT JOIN sub_location sl ON a.location_id = sl.location_id
               LEFT JOIN shift_policy_master sp ON a.shift_id = sp.policy_id
               WHERE 1=1`;
    const params = [];

    if (date) {
      sql += ` AND a.attendance_date = $${params.length + 1}`;
      params.push(date);
    }
    if (locationId) {
      sql += ` AND a.location_id = $${params.length + 1}`;
      params.push(Number(locationId));
    }
    if (status) {
      sql += ` AND a.final_status = $${params.length + 1}`;
      params.push(status);
    }
    if (employeeId) {
      sql += ` AND a.employee_id = $${params.length + 1}`;
      params.push(Number(employeeId));
    }

    sql += ` ORDER BY e.first_name, a.attendance_date DESC`;

    const result = await query(sql, params);
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { employee_id, attendance_date, location_id, shift_id, check_in, check_out, total_hours, status, remarks } = body;

    if (!employee_id || !attendance_date) {
      return Response.json(
        { message: "employee_id and attendance_date are required." },
        { status: 400 }
      );
    }

    const result = await query(
      `WITH ins AS (
        INSERT INTO attendance
          (employee_id, attendance_date, location_id, shift_id,
           check_in_time, check_out_time, raw_check_in, raw_check_out,
           worked_hours, final_status, remarks)
        VALUES ($1, $2, $3, $4,
                CASE WHEN $5 IS NOT NULL THEN ($2 || ' ' || $5)::timestamp ELSE NULL END,
                CASE WHEN $6 IS NOT NULL THEN ($2 || ' ' || $6)::timestamp ELSE NULL END,
                CASE WHEN $5 IS NOT NULL THEN ($2 || ' ' || $5)::timestamp ELSE NULL END,
                CASE WHEN $6 IS NOT NULL THEN ($2 || ' ' || $6)::timestamp ELSE NULL END,
                $7, $8, $9)
        ON CONFLICT (employee_id, attendance_date)
        DO UPDATE SET
          check_in_time = COALESCE(EXCLUDED.check_in_time, attendance.check_in_time),
          check_out_time = COALESCE(EXCLUDED.check_out_time, attendance.check_out_time),
          raw_check_in = COALESCE(EXCLUDED.raw_check_in, attendance.raw_check_in),
          raw_check_out = COALESCE(EXCLUDED.raw_check_out, attendance.raw_check_out),
          worked_hours = COALESCE(EXCLUDED.worked_hours, attendance.worked_hours),
          final_status = COALESCE(EXCLUDED.final_status, attendance.final_status),
          location_id = COALESCE(EXCLUDED.location_id, attendance.location_id),
          shift_id = COALESCE(EXCLUDED.shift_id, attendance.shift_id),
          remarks = COALESCE(EXCLUDED.remarks, attendance.remarks),
          updated_at = NOW()
        RETURNING *
      )
      SELECT
        ins.attendance_id, ins.employee_id, ins.attendance_date,
        ins.check_in_time::text as check_in, ins.check_out_time::text as check_out,
        ins.worked_hours as total_hours, ins.final_status as status,
        ins.location_id, ins.shift_id, ins.remarks
      FROM ins`,
      [
        Number(employee_id),
        attendance_date,
        location_id ? Number(location_id) : null,
        shift_id ? Number(shift_id) : null,
        check_in || null,
        check_out || null,
        total_hours ? Number(total_hours) : null,
        status || "Present",
        remarks || null,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
