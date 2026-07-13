import { query } from "@/src/lib/db";

const safeNumber = v => { const n = Number(v); return Number.isFinite(n) && n !== 0 ? n : null; };

const CONSTRAINT_MESSAGES = {
  employee_master_phone_key: "This phone number is already in use by another employee.",
  employee_master_login_id_key: "This login ID is already in use by another employee.",
};

function friendlyConstraintError(error) {
  if (!error?.message) return null;
  for (const [constraint, msg] of Object.entries(CONSTRAINT_MESSAGES)) {
    if (error.message.includes(constraint)) return msg;
  }
  return null;
}

const EMPLOYEE_JOINS = `
  LEFT JOIN parent_entity pe ON e.parent_entity_id = pe.entity_id
  LEFT JOIN sub_location sl ON e.location_id = sl.location_id
  LEFT JOIN department_master dep ON e.department_id = dep.department_id
  LEFT JOIN designation_master des ON e.designation_id = des.designation_id
  LEFT JOIN employee_profile ep ON e.employee_id = ep.employee_id
  LEFT JOIN employee_address ea ON e.employee_id = ea.employee_id
  LEFT JOIN employee_emergency_contact eec ON e.employee_id = eec.employee_id
  LEFT JOIN employee_statutory es ON e.employee_id = es.employee_id
  LEFT JOIN employee_finance ef ON e.employee_id = ef.employee_id
  LEFT JOIN employee_documents ed ON e.employee_id = ed.employee_id
  LEFT JOIN employee_skills esk ON e.employee_id = esk.employee_id
`;

const EMPLOYEE_COLS = `
    e.*,
    pe.entity_code, pe.legal_name AS entity_name,
    sl.location_name, sl.location_code,
    dep.department_name, dep.department_short_code,
    des.designation_name, des.designation_code,
    ep.date_of_birth, ep.blood_group, ep.marital_status, ep.nationality,
    ep.father_name AS guardian_name, ep.spouse_name,
    ea.present_address_line1 AS present_address, ea.present_city AS address_city,
    ea.present_state AS address_state, ea.present_pincode AS address_pincode,
    ea.same_address AS same_as_present,
    ea.permanent_address_line1 AS permanent_address,
    ea.permanent_city, ea.permanent_state, ea.permanent_pincode,
    eec.contact_name AS emergency_contact_name, eec.relationship AS emergency_relationship,
    eec.phone AS emergency_phone, eec.alternate_phone AS emergency_alt_phone,
    eec.address AS emergency_address,
    es.aadhaar_number, es.pan_number, es.uan_number, es.pf_number, es.esi_number,
    es.nominee_name,
    ef.bank_name, ef.bank_branch AS branch_name, ef.account_number, ef.ifsc_code,
    ef.bank_verification_status,
    ed.document_type, ed.document_number, ed.document_status, ed.document_file,
    esk.skill_name AS primary_skill, esk.skill_level
`;

async function attachSkillsAndCerts(employees) {
  if (!employees || employees.length === 0) return;
  const ids = employees.map(e => e.employee_id);
  const [skillsRes, certsRes] = await Promise.all([
    query(
      `SELECT employee_id, skill_name, skill_level FROM employee_skills WHERE employee_id = ANY($1::int[]) ORDER BY skill_id`,
      [ids]
    ),
    query(
      `SELECT employee_id, certification_name, issuing_authority, issue_date, expiry_date, certificate_file FROM employee_certifications WHERE employee_id = ANY($1::int[]) ORDER BY id`,
      [ids]
    )
  ]);
  const skillsByEmp = {};
  for (const row of skillsRes.rows) {
    if (!skillsByEmp[row.employee_id]) skillsByEmp[row.employee_id] = [];
    skillsByEmp[row.employee_id].push({ skill_name: row.skill_name, skill_level: row.skill_level });
  }
  const certsByEmp = {};
  for (const row of certsRes.rows) {
    if (!certsByEmp[row.employee_id]) certsByEmp[row.employee_id] = [];
    certsByEmp[row.employee_id].push({
      certification_name: row.certification_name,
      issuing_authority: row.issuing_authority,
      issue_date: row.issue_date,
      expiry_date: row.expiry_date,
      certificate_file: row.certificate_file
    });
  }
  for (const emp of employees) {
    emp.skills = skillsByEmp[emp.employee_id] || [];
    emp.certifications = certsByEmp[emp.employee_id] || [];
  }
}

export async function GET() {
  try {
    const result = await query(
      `SELECT DISTINCT ON (e.employee_id) ${EMPLOYEE_COLS}
       FROM employee_master e
       ${EMPLOYEE_JOINS}
       ORDER BY e.employee_id, e.first_name, e.last_name`
    );
    await attachSkillsAndCerts(result.rows);
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

    const entityId = safeNumber(body.parent_entity_id);
    const entityResult = entityId
      ? await query(
          `SELECT entity_code, legal_name FROM parent_entity WHERE entity_id = $1`,
          [entityId]
        ).catch(() => ({ rows: [] }))
      : { rows: [] };
    const entityCode = entityResult.rows[0]?.entity_code || "UNKNOWN";

    const locId = safeNumber(body.location_id);
    const locationResult = locId
      ? await query(
          `SELECT location_name, location_code FROM sub_location WHERE location_id = $1`,
          [locId]
        ).catch(() => ({ rows: [] }))
      : { rows: [] };
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
    const roleId = safeNumber(body.role_id);
    const isSalesperson = body.is_salesperson === true || body.is_salesperson === "true";
    const faceRegistered = body.face_registered === true || body.face_registered === "true";
    const departmentId = safeNumber(body.department_id);
    const designationId = safeNumber(body.designation_id);
    const locationId = safeNumber(body.location_id);
    const parentEntityId = safeNumber(body.parent_entity_id);
    const reportingManagerId = safeNumber(body.reporting_manager_id);
    const employeeCategory = body.employee_category || null;
    const isReportingManager = body.is_reporting_manager_eligible === true || body.is_reporting_manager_eligible === "true";
    const defaultShiftId = safeNumber(body.default_shift_id);
    const shiftPreferenceMode = body.shift_preference_mode || null;
    const preferredWeeklyOffDay = safeNumber(body.preferred_week_off_day);

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
          present_state, present_pincode, same_address,
          permanent_address_line1, permanent_city, permanent_state, permanent_pincode)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [employeeId,
         body.present_address || null,
         body.address_city || null,
         body.address_state || null,
         body.address_pincode || null,
         sameAddress,
         body.permanent_address || null,
         body.permanent_city || null,
         body.permanent_state || null,
         body.permanent_pincode || null]
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

    if (body.document_type || body.document_number || body.document_status || body.document_file) {
      await query(
        `INSERT INTO employee_documents (employee_id, document_type, document_number, document_status, document_file)
         VALUES ($1,$2,$3,$4,$5)`,
        [employeeId,
         body.document_type || null,
         body.document_number || null,
         body.document_status || null,
         body.document_file || null]
      );
    }

    if (body.skills && Array.isArray(body.skills) && body.skills.length) {
      for (const skill of body.skills) {
        if (skill.skill_name) {
          await query(
            `INSERT INTO employee_skills (employee_id, skill_name, skill_level)
             VALUES ($1,$2,$3)`,
            [employeeId, skill.skill_name, skill.skill_level || null]
          );
        }
      }
    } else if (body.primary_skill) {
      await query(
        `INSERT INTO employee_skills (employee_id, skill_name, skill_level)
         VALUES ($1,$2,$3)`,
        [employeeId,
         body.primary_skill,
         body.skill_level || null]
      );
    }

    if (body.certifications && Array.isArray(body.certifications) && body.certifications.length) {
      for (const cert of body.certifications) {
        if (cert.certification_name) {
          await query(
            `INSERT INTO employee_certifications (employee_id, certification_name, issuing_authority, issue_date, expiry_date, certificate_file)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [employeeId,
             cert.certification_name,
             cert.issuing_authority || null,
             cert.issue_date || null,
             cert.expiry_date || null,
             cert.certificate_file || null]
          );
        }
      }
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
      `SELECT DISTINCT ON (e.employee_id) ${EMPLOYEE_COLS}
       FROM employee_master e
       ${EMPLOYEE_JOINS}
       WHERE e.employee_id = $1
       ORDER BY e.employee_id`,
      [employeeId]
    );

    const emp = fullResult.rows[0];
    if (emp) await attachSkillsAndCerts([emp]);

    return Response.json(emp, { status: 201 });
  } catch (error) {
    const friendly = friendlyConstraintError(error);
    return Response.json({ message: friendly || error.message }, { status: friendly ? 409 : 500 });
  }
}
