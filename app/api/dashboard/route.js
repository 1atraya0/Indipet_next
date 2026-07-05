import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    const [employeeCount, locationCount, entityCount, presentResult, pendingResult, rosterResult, weeklyResult] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM employee_master WHERE status = 'Active'`),
      query(`SELECT COUNT(*)::int AS count FROM sub_location WHERE status = 'active'`),
      query(`SELECT COUNT(*)::int AS count FROM parent_entity WHERE status = 'active'`),
      query(
        `SELECT COUNT(*)::int AS count FROM attendance
         WHERE attendance_date = $1 AND final_status IN ('Present', 'Late', 'Half-Day')`,
        [today]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM attendance_regularization WHERE status = 'Pending'`
      ),
      query(
        `SELECT COALESCE(SUM(filled_slots), 0)::int AS filled,
                COALESCE(SUM(filled_slots + open_slots), 0)::int AS total
         FROM rosters WHERE status = 'Published'`
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
        [weekAgo, today]
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

    const totalRoster = rosterResult.rows[0]?.total ?? 0;
    const filledRoster = rosterResult.rows[0]?.filled ?? 0;
    const rosterCoverage = totalRoster > 0
      ? String(Math.round((filledRoster / totalRoster) * 100)) + "%"
      : "--";

    const totalActive = employeeCount.rows[0]?.count ?? 0;

    return Response.json({
      activeWorkforce: totalActive,
      activeLocations: locationCount.rows[0]?.count ?? 0,
      activeEntities: entityCount.rows[0]?.count ?? 0,
      presentToday: presentResult.rows[0]?.count ?? 0,
      totalActive,
      pendingApprovals: pendingResult.rows[0]?.count ?? 0,
      rosterCoverage,
      weeklyData,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
