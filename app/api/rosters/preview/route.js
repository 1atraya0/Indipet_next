import { query } from "@/src/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const preferenceHandling = searchParams.get("preference_handling") || "respect";
    const leaveHandling = searchParams.get("leave_handling") || "approved";

    if (!locationId || !startDate || !endDate) {
      return Response.json(
        { message: "location_id, start_date, and end_date are required." },
        { status: 400 }
      );
    }

    const locResult = await query(
      `SELECT sl.location_id, sl.location_code, sl.location_name, sl.location_type,
              sl.status, sl.state, sl.brand_flag, sl.onboarding_status,
              sl.parent_entity_id, pe.entity_code AS parent_entity_code,
              pe.legal_name AS parent_entity_name
       FROM sub_location sl
       LEFT JOIN parent_entity pe ON sl.parent_entity_id = pe.entity_id
       WHERE sl.location_id = $1`,
      [Number(locationId)]
    );
    if (!locResult.rows[0]) {
      return Response.json({ message: "Location not found." }, { status: 404 });
    }
    const locRow = locResult.rows[0];

    const empResult = await query(
      `SELECT e.employee_id, e.employee_code, e.first_name, e.last_name,
              e.default_shift_id, e.shift_preference_mode, e.preferred_weekly_off_day,
              e.status, e.is_reporting_manager,
              dep.department_name, dep.department_short_code,
              des.designation_name, des.designation_code
       FROM employee_master e
       LEFT JOIN department_master dep ON e.department_id = dep.department_id
       LEFT JOIN designation_master des ON e.designation_id = des.designation_id
       WHERE e.location_id = $1 AND e.status = 'Active'
       ORDER BY e.first_name, e.last_name`,
      [Number(locationId)]
    );
    const employees = empResult.rows;

    const shiftResult = await query(
      `SELECT * FROM shift_policy_master
       WHERE location_id = $1 AND policy_status = 'Active'
       ORDER BY policy_id`,
      [Number(locationId)]
    );
    const shifts = shiftResult.rows;

    const holidayResult = await query(
      `SELECT * FROM holiday_calendar
       WHERE (location_id = $1 OR location_id IS NULL)
         AND holiday_date >= $2 AND holiday_date <= $3
       ORDER BY holiday_date`,
      [Number(locationId), startDate, endDate]
    );
    const holidays = holidayResult.rows;

    const lrResult = await query(
      `SELECT lr.*, e.employee_code, e.first_name, e.last_name,
              lt.leave_code, lt.leave_name
       FROM leave_requests lr
       JOIN employee_master e ON lr.employee_id = e.employee_id
       LEFT JOIN leave_type_master lt ON lr.leave_type_id = lt.leave_type_id
       WHERE e.location_id = $1
         AND lr.start_date <= $3 AND lr.end_date >= $2
       ORDER BY lr.start_date`,
      [Number(locationId), startDate, endDate]
    );
    const leaveRequests = lrResult.rows;

    const dates = [];
    const cursor = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    while (cursor <= end && dates.length < 32) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      dates.push({
        iso: `${y}-${m}-${d}`,
        dayOfWeek: cursor.getDay(),
        dayName: cursor.toLocaleDateString("en-GB", { weekday: "short" }),
        label: cursor.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const holidayMap = {};
    for (const h of holidays) {
      holidayMap[h.holiday_date] = h;
    }

    const leaveMap = {};
    for (const lr of leaveRequests) {
      const empId = lr.employee_id;
      if (!leaveMap[empId]) leaveMap[empId] = [];
      leaveMap[empId].push(lr);
    }

    function getLeaveForDate(employeeId, dateIso) {
      const requests = leaveMap[employeeId] || [];
      return requests.filter(lr => {
        const lrStart = lr.start_date.slice(0, 10);
        const lrEnd = lr.end_date.slice(0, 10);
        const blocked = leaveHandling === "approved_pending"
          ? true
          : lr.status === "Approved" || lr.status === "approved";
        return blocked && dateIso >= lrStart && dateIso <= lrEnd;
      });
    }

    const preferredOffDayMap = {};
    for (const emp of employees) {
      preferredOffDayMap[emp.employee_id] = emp.preferred_weekly_off_day;
    }

    const allocation = {};
    const coverage = {};
    const validation = [];

    for (const dateObj of dates) {
      const dateIso = dateObj.iso;
      const holiday = holidayMap[dateIso];
      const isStoreClosed = holiday && holiday.is_closed === true;
      const dow = dateObj.dayOfWeek;

      if (!coverage[dateIso]) {
        coverage[dateIso] = {
          isHoliday: !!holiday,
          isStoreClosed,
          holidayName: holiday ? holiday.holiday_name : null,
          shifts: shifts.map(s => ({
            policy_id: s.policy_id,
            policy_name: s.policy_name,
            shift_type: s.shift_type,
            sanctioned: Number(s.sanctioned_strength) || 1,
            allocated: 0,
            keyholder_required: s.keyholder_required === true,
            keyholder_allocated: 0,
            gap: Number(s.sanctioned_strength) || 1,
          })),
        };
      }

      if (isStoreClosed) {
        for (const emp of employees) {
          const empId = emp.employee_id;
          if (!allocation[empId]) allocation[empId] = {};
          allocation[empId][dateIso] = {
            shift: null,
            type: "store_closed",
            source: "holiday",
            conflicts: [],
          };
        }
        continue;
      }

      const available = [];
      for (const emp of employees) {
        const empId = emp.employee_id;
        if (!allocation[empId]) allocation[empId] = {};

        const activeLeaves = getLeaveForDate(empId, dateIso);
        if (activeLeaves.length > 0) {
          allocation[empId][dateIso] = {
            shift: null,
            type: "leave",
            source: "blocked",
            conflicts: activeLeaves.map(lr => `Leave: ${lr.leave_name || lr.leave_code}`),
          };
          continue;
        }

        const prefOffDay = preferredOffDayMap[empId];
        if (prefOffDay !== null && prefOffDay !== undefined && prefOffDay !== "") {
          const prefDow = Number(prefOffDay);
          if (prefDow === dow) {
            allocation[empId][dateIso] = {
              shift: null,
              type: "weekly_off",
              source: "preference",
              conflicts: [],
            };
            continue;
          }
        }

        available.push(emp);
      }

      const shiftCapacities = coverage[dateIso].shifts.map((cs, idx) => ({
        idx,
        policy_id: cs.policy_id,
        policy_name: cs.policy_name,
        sanctioned: cs.sanctioned,
        allocated: 0,
      }));

      for (const emp of available) {
        const empId = emp.employee_id;
        let assignedShift = null;

        if (emp.default_shift_id && shifts.length > 0) {
          const matched = shifts.find(s => s.policy_id === Number(emp.default_shift_id));
          if (matched) {
            const cap = shiftCapacities.find(sc => sc.policy_id === matched.policy_id);
            if (cap && cap.allocated < cap.sanctioned) {
              assignedShift = matched;
              cap.allocated++;
            }
          }
        }

        if (!assignedShift && shifts.length > 0) {
          const sorted = [...shiftCapacities].sort((a, b) => (a.allocated / a.sanctioned) - (b.allocated / b.sanctioned));
          for (const sc of sorted) {
            if (sc.allocated < sc.sanctioned) {
              assignedShift = shifts.find(s => s.policy_id === sc.policy_id);
              if (assignedShift) {
                sc.allocated++;
                break;
              }
            }
          }
        }

        if (assignedShift) {
          allocation[empId][dateIso] = {
            shift: assignedShift.policy_name,
            shiftType: assignedShift.shift_type,
            policy_id: assignedShift.policy_id,
            type: "assigned",
            source: preferenceHandling === "respect" && emp.default_shift_id ? "preferred" : "auto",
            conflicts: [],
          };

          const dayCoverage = coverage[dateIso].shifts.find(
            cs => cs.policy_id === assignedShift.policy_id
          );
          if (dayCoverage) {
            dayCoverage.allocated++;
            dayCoverage.gap = Math.max(0, dayCoverage.sanctioned - dayCoverage.allocated);
            if (assignedShift.keyholder_required === true) {
              dayCoverage.keyholder_allocated++;
            }
          }
        } else {
          allocation[empId][dateIso] = {
            shift: null,
            type: "unassigned",
            source: "no_shift",
            conflicts: ["No capacity — all shifts at sanctioned strength"],
          };
        }
      }
    }

    const summary = {
      totalEmployees: employees.length,
      totalShifts: shifts.length,
      totalDays: dates.length,
      totalSlots: employees.length * dates.length,
      storeClosedDays: dates.filter(d => coverage[d.iso]?.isStoreClosed).length,
    };

    const genShifts = shifts.map(s => [
      s.policy_id,
      s.policy_name,
      s.shift_type,
      String(s.sanctioned_strength || 1),
      s.weekly_off_pattern || "Rotational",
      s.policy_status || "Active",
      s.coverage_mode || "Standard",
      s.shift_start_time || "00:00",
      s.shift_end_time || "00:00",
      s.total_shift_hours || 0,
      s.break_duration_minutes || 0,
      s.net_work_hours || 0,
      s.max_leave_per_day || 1,
      s.keyholder_required === true ? "Yes" : "No",
      s.max_consecutive_days || 6,
    ]);

    return Response.json({
      location: {
        id: locRow.location_code || String(locRow.location_id),
        dbId: locRow.location_id,
        name: locRow.brand_flag || locRow.location_name,
        listName: locRow.location_name,
      },
      period: { start: startDate, end: endDate },
      dates,
      employees,
      shifts: genShifts,
      holidays,
      leaveRequests,
      allocation,
      coverage,
      validation,
      summary,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
