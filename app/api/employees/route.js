import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT e.*,
        pe.entity_code, pe.legal_name AS entity_name,
        sl.location_name, sl.location_code,
        dep.department_name, dep.department_short_code,
        des.designation_name, des.designation_code
       FROM employee_master e
       LEFT JOIN parent_entity pe ON e.parent_entity_id = pe.entity_id
       LEFT JOIN sub_location sl ON e.location_id = sl.location_id
       LEFT JOIN department_master dep ON e.department_id = dep.department_id
       LEFT JOIN designation_master des ON e.designation_id = des.designation_id
       ORDER BY e.first_name, e.last_name`
    );
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.first_name || !body.last_name) {
      return Response.json({ message: "first_name and last_name are required." }, { status: 400 });
    }

    const entityResult = await query(
      `SELECT entity_code, legal_name FROM parent_entity WHERE entity_id = $1`,
      [Number(body.parent_entity_id)]
    );
    const entityCode = entityResult.rows[0]?.entity_code || "UNKNOWN";

    const locationResult = await query(
      `SELECT location_name, location_code FROM sub_location WHERE location_id = $1`,
      [Number(body.location_id)]
    );
    const locationAbbrev = locationResult.rows[0]?.location_code
      ? locationResult.rows[0].location_code.replace(/^[A-Z]+/, "").slice(0, 4)
      : (locationResult.rows[0]?.location_name || "XX").replace(/[^A-Z]/g, "").slice(0, 4);

    const maxResult = await query(
      `SELECT COALESCE(MAX(employee_id), 0) + 1 AS next_seq FROM employee_master`
    );
    const nextSeq = String(maxResult.rows[0]?.next_seq || 1).padStart(4, "0");
    const employeeCode = body.employee_code || `${entityCode}-${locationAbbrev}-E${nextSeq}`;

    const status = body.status || "Active";
    const employeeType = body.employee_type || null;
    const employmentSubtype = body.employment_subtype || null;
    const dateOfJoining = body.date_of_joining || null;
    const gender = body.gender || null;
    const phone = body.phone || null;
    const email = body.email || null;
    const loginId = body.login_id || null;
    const roleId = body.role_id ? Number(body.role_id) : null;
    const isSalesperson = body.is_salesperson === true || body.is_salesperson === "true";
    const faceRegistered = body.face_registered === true || body.face_registered === "true";
    const departmentId = body.department_id ? Number(body.department_id) : null;
    const designationId = body.designation_id ? Number(body.designation_id) : null;
    const locationId = body.location_id ? Number(body.location_id) : null;
    const parentEntityId = body.parent_entity_id ? Number(body.parent_entity_id) : null;
    const reportingManagerId = body.reporting_manager_id ? Number(body.reporting_manager_id) : null;
    const employeeCategory = body.employee_category || null;
    const isReportingManager = body.is_reporting_manager_eligible === true || body.is_reporting_manager_eligible === "true";
    const defaultShiftId = body.default_shift_id ? Number(body.default_shift_id) : null;
    const shiftPreferenceMode = body.shift_preference_mode || null;
    const preferredWeeklyOffDay = body.preferred_week_off_day ? Number(body.preferred_week_off_day) : null;

    const empResult = await query(
      `INSERT INTO employee_master (employee_code, employee_type, employment_subtype,
        first_name, last_name, phone, email, gender, department_id, designation_id,
        location_id, parent_entity_id, reporting_manager_id, employee_category,
        date_of_joining, original_doj, is_salesperson, login_id, role_id,
        default_shift_id, face_registered, shift_preference_mode, status,
        is_reporting_manager, preferred_weekly_off_day)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING employee_id`,
      [employeeCode, employeeType, employmentSubtype,
       body.first_name, body.last_name, phone, email, gender,
       departmentId, designationId, locationId, parentEntityId,
       reportingManagerId, employeeCategory, dateOfJoining, dateOfJoining,
       isSalesperson, loginId, roleId, defaultShiftId, faceRegistered,
       shiftPreferenceMode, status, isReportingManager, preferredWeeklyOffDay]
    );

    const employeeId = empResult.rows[0].employee_id;

    if (body.date_of_birth || body.blood_group || body.marital_status || body.nationality || body.guardian_name || body.spouse_name) {
      await query(
        `INSERT INTO employee_profile (employee_id, date_of_birth, blood_group, marital_status,
          nationality, father_name, spouse_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [employeeId,
         body.date_of_birth || null,
         body.blood_group || null,
         body.marital_status || null,
         body.nationality || null,
         body.guardian_name || null,
         body.spouse_name || null]
      );
    }

    if (body.present_address || body.address_city || body.address_state || body.address_pincode || body.permanent_address) {
      const sameAddress = body.same_as_present === true || body.same_as_present === "true";
      await query(
        `INSERT INTO employee_address (employee_id, present_address_line1, present_city,
          present_state, present_pincode, same_address, permanent_address_line1)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [employeeId,
         body.present_address || null,
         body.address_city || null,
         body.address_state || null,
         body.address_pincode || null,
         sameAddress,
         body.permanent_address || null]
      );
    }

    if (body.emergency_contact_name || body.emergency_relationship || body.emergency_phone || body.emergency_address) {
      await query(
        `INSERT INTO employee_emergency_contact (employee_id, contact_name, relationship,
          phone, alternate_phone, address)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [employeeId,
         body.emergency_contact_name || null,
         body.emergency_relationship || null,
         body.emergency_phone || null,
         body.emergency_alt_phone || null,
         body.emergency_address || null]
      );
    }

    if (body.aadhaar_number || body.pan_number || body.uan_number || body.pf_number || body.esi_number || body.nominee_name) {
      await query(
        `INSERT INTO employee_statutory (employee_id, aadhaar_number, pan_number,
          uan_number, pf_number, esi_number, nominee_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [employeeId,
         body.aadhaar_number || null,
         body.pan_number || null,
         body.uan_number || null,
         body.pf_number || null,
         body.esi_number || null,
         body.nominee_name || null]
      );
    }

    if (body.bank_name || body.branch_name || body.account_number || body.ifsc_code || body.bank_verification_status) {
      await query(
        `INSERT INTO employee_finance (employee_id, bank_name, bank_branch,
          account_number, ifsc_code, bank_verification_status)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [employeeId,
         body.bank_name || null,
         body.branch_name || null,
         body.account_number || null,
         body.ifsc_code || null,
         body.bank_verification_status || null]
      );
    }

    if (body.document_type || body.document_number || body.document_status) {
      await query(
        `INSERT INTO employee_documents (employee_id, document_type, document_number, document_status)
         VALUES ($1,$2,$3,$4)`,
        [employeeId,
         body.document_type || null,
         body.document_number || null,
         body.document_status || null]
      );
    }

    if (body.primary_skill) {
      await query(
        `INSERT INTO employee_skills (employee_id, skill_name, skill_level)
         VALUES ($1,$2,$3)`,
        [employeeId,
         body.primary_skill,
         body.skill_level || null]
      );
    }

    if (body.shift_restriction_note || body.shift_preference_mode) {
      await query(
        `INSERT INTO employee_shift_preference (employee_id, preference_type, preference_detail)
         VALUES ($1,$2,$3)`,
        [employeeId,
         body.shift_preference_mode || null,
         body.shift_restriction_note || null]
      );
    }

    const fullResult = await query(
      `SELECT e.*,
        pe.entity_code, pe.legal_name AS entity_name,
        sl.location_name, sl.location_code,
        dep.department_name, dep.department_short_code,
        des.designation_name, des.designation_code
       FROM employee_master e
       LEFT JOIN parent_entity pe ON e.parent_entity_id = pe.entity_id
       LEFT JOIN sub_location sl ON e.location_id = sl.location_id
       LEFT JOIN department_master dep ON e.department_id = dep.department_id
       LEFT JOIN designation_master des ON e.designation_id = des.designation_id
       WHERE e.employee_id = $1`,
      [employeeId]
    );

    return Response.json(fullResult.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
