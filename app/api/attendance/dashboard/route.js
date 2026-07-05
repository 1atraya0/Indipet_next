import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [attendanceResult, weeklyResult, employeeResult] = await Promise.all([
      query(
        `SELECT
           a.attendance_id, a.employee_id, a.attendance_date,
           a.check_in_time::text as check_in, a.check_out_time::text as check_out,
           a.worked_hours as total_hours, a.final_status as status,
           a.location_id, a.shift_id,
           e.first_name, e.last_name, e.employee_code,
           sl.location_name, sp.policy_name as shift_name
         FROM attendance a
         JOIN employee_master e ON a.employee_id = e.employee_id
         LEFT JOIN sub_location sl ON a.location_id = sl.location_id
         LEFT JOIN shift_policy_master sp ON a.shift_id = sp.policy_id
         WHERE a.attendance_date = $1
         ORDER BY e.first_name`,
        [today]
      ),
      query(
        `SELECT
           EXTRACT(DOW FROM attendance_date) AS day_of_week,
           COUNT(*) FILTER (WHERE final_status = 'Present') AS present,
           COUNT(*) FILTER (WHERE final_status = 'Leave') AS leave,
           COUNT(*) FILTER (WHERE final_status = 'Absent') AS absent
         FROM attendance
         WHERE attendance_date >= $1 AND attendance_date <= $2
         GROUP BY EXTRACT(DOW FROM attendance_date)
         ORDER BY EXTRACT(DOW FROM attendance_date)`,
        [new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), today]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM employee_master WHERE status = 'Active'`
      ),
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = dayNames.map((day, i) => {
      const found = weeklyResult.rows.find(r => Number(r.day_of_week) === i);
      return {
        day,
        present: found ? Number(found.present) : 0,
        leave: found ? Number(found.leave) : 0,
        absent: found ? Number(found.absent) : 0,
      };
    });

    const records = attendanceResult.rows.map(r => ({
      id: r.employee_code,
      name: `${r.first_name} ${r.last_name}`,
      initials: ((r.first_name || "")[0] || "") + ((r.last_name || "")[0] || ""),
      location: r.location_name || `Location ${r.location_id}`,
      shift: r.shift_name || "-",
      checkIn: r.check_in ? new Date(r.check_in).toTimeString().slice(0, 5) : "-",
      checkOut: r.check_out ? new Date(r.check_out).toTimeString().slice(0, 5) : "-",
      status: r.status,
    }));

    return Response.json({
      records,
      weeklyData,
      totalActive: employeeResult.rows[0]?.count || 0,
      presentCount: records.filter(r => r.status === "Present").length,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
