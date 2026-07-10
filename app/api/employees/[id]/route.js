import { query } from "@/src/lib/db";

const safeNumber = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };

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
    ed.document_type, ed.document_number, ed.document_status,
    esk.skill_name AS primary_skill, esk.skill_level
`;

async function upsertProfile(employeeId, body) {
  if (!body.date_of_birth && !body.blood_group && !body.marital_status && !body.nationality && !body.guardian_name && !body.spouse_name) return;
  await query(
    `INSERT INTO employee_profile (employee_id, date_of_birth, blood_group, marital_status, nationality, father_name, spouse_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (employee_id) DO UPDATE SET
       date_of_birth = COALESCE($2, employee_profile.date_of_birth),
       blood_group = COALESCE($3, employee_profile.blood_group),
       marital_status = COALESCE($4, employee_profile.marital_status),
       nationality = COALESCE($5, employee_profile.nationality),
       father_name = COALESCE($6, employee_profile.father_name),
       spouse_name = COALESCE($7, employee_profile.spouse_name)`,
    [employeeId, body.date_of_birth || null, body.blood_group || null, body.marital_status || null,
     body.nationality || null, body.guardian_name || null, body.spouse_name || null]
  );
}

async function upsertAddress(employeeId, body) {
  if (!body.present_address && !body.address_city && !body.address_state && !body.address_pincode && !body.permanent_address) return;
  const sameAddress = body.same_as_present === true || body.same_as_present === "true";
  await query(
    `INSERT INTO employee_address (employee_id, present_address_line1, present_city, present_state, present_pincode,
      same_address, permanent_address_line1, permanent_city, permanent_state, permanent_pincode)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (employee_id) DO UPDATE SET
       present_address_line1 = COALESCE($2, employee_address.present_address_line1),
       present_city = COALESCE($3, employee_address.present_city),
       present_state = COALESCE($4, employee_address.present_state),
       present_pincode = COALESCE($5, employee_address.present_pincode),
       same_address = $6,
       permanent_address_line1 = COALESCE($7, employee_address.permanent_address_line1),
       permanent_city = COALESCE($8, employee_address.permanent_city),
       permanent_state = COALESCE($9, employee_address.permanent_state),
       permanent_pincode = COALESCE($10, employee_address.permanent_pincode)`,
    [employeeId, body.present_address || null, body.address_city || null, body.address_state || null,
     body.address_pincode || null, sameAddress, body.permanent_address || null,
     body.permanent_city || null, body.permanent_state || null, body.permanent_pincode || null]
  );
}

async function upsertEmergencyContact(employeeId, body) {
  if (!body.emergency_contact_name && !body.emergency_relationship && !body.emergency_phone && !body.emergency_address) return;
  await query(
    `INSERT INTO employee_emergency_contact (employee_id, contact_name, relationship, phone, alternate_phone, address)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (employee_id) DO UPDATE SET
       contact_name = COALESCE($2, employee_emergency_contact.contact_name),
       relationship = COALESCE($3, employee_emergency_contact.relationship),
       phone = COALESCE($4, employee_emergency_contact.phone),
       alternate_phone = COALESCE($5, employee_emergency_contact.alternate_phone),
       address = COALESCE($6, employee_emergency_contact.address)`,
    [employeeId, body.emergency_contact_name || null, body.emergency_relationship || null,
     body.emergency_phone || null, body.emergency_alt_phone || null, body.emergency_address || null]
  );
}

async function upsertStatutory(employeeId, body) {
  if (!body.aadhaar_number && !body.pan_number && !body.uan_number && !body.pf_number && !body.esi_number && !body.nominee_name) return;
  await query(
    `INSERT INTO employee_statutory (employee_id, aadhaar_number, pan_number, uan_number, pf_number, esi_number, nominee_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (employee_id) DO UPDATE SET
       aadhaar_number = COALESCE($2, employee_statutory.aadhaar_number),
       pan_number = COALESCE($3, employee_statutory.pan_number),
       uan_number = COALESCE($4, employee_statutory.uan_number),
       pf_number = COALESCE($5, employee_statutory.pf_number),
       esi_number = COALESCE($6, employee_statutory.esi_number),
       nominee_name = COALESCE($7, employee_statutory.nominee_name)`,
    [employeeId, body.aadhaar_number || null, body.pan_number || null, body.uan_number || null,
     body.pf_number || null, body.esi_number || null, body.nominee_name || null]
  );
}

async function upsertFinance(employeeId, body) {
  if (!body.bank_name && !body.branch_name && !body.account_number && !body.ifsc_code) return;
  await query(
    `INSERT INTO employee_finance (employee_id, bank_name, bank_branch, account_number, ifsc_code, bank_verification_status)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (employee_id) DO UPDATE SET
       bank_name = COALESCE($2, employee_finance.bank_name),
       bank_branch = COALESCE($3, employee_finance.bank_branch),
       account_number = COALESCE($4, employee_finance.account_number),
       ifsc_code = COALESCE($5, employee_finance.ifsc_code),
       bank_verification_status = COALESCE($6, employee_finance.bank_verification_status)`,
    [employeeId, body.bank_name || null, body.branch_name || null, body.account_number || null,
     body.ifsc_code || null, body.bank_verification_status || null]
  );
}

async function upsertDocuments(employeeId, body) {
  if (!body.document_type && !body.document_number && !body.document_status) return;
  await query(`DELETE FROM employee_documents WHERE employee_id = $1`, [employeeId]);
  await query(
    `INSERT INTO employee_documents (employee_id, document_type, document_number, document_status)
     VALUES ($1,$2,$3,$4)`,
    [employeeId, body.document_type || null, body.document_number || null, body.document_status || null]
  );
}

async function upsertSkills(employeeId, body) {
  if (!body.primary_skill) return;
  await query(
    `INSERT INTO employee_skills (employee_id, skill_name, skill_level)
     VALUES ($1,$2,$3)
     ON CONFLICT (employee_id) DO UPDATE SET
       skill_name = COALESCE($2, employee_skills.skill_name),
       skill_level = COALESCE($3, employee_skills.skill_level)`,
    [employeeId, body.primary_skill, body.skill_level || null]
  );
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const employeeId = Number(id);

    const allowed = [
      "employee_code", "employee_type", "employment_subtype",
      "first_name", "last_name", "phone", "email", "gender",
      "department_id", "designation_id", "location_id", "parent_entity_id",
      "reporting_manager_id", "employee_category",
      "date_of_joining", "original_doj", "is_salesperson",
      "login_id", "role_id", "default_shift_id", "face_registered",
      "shift_preference_mode", "status", "is_reporting_manager",
      "preferred_weekly_off_day"
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

    if (sets.length > 0) {
      values.push(employeeId);
      const result = await query(
        `UPDATE employee_master SET ${sets.join(", ")} WHERE employee_id = $${idx}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return Response.json({ message: "Employee not found." }, { status: 404 });
      }
    }

    await Promise.all([
      upsertProfile(employeeId, body),
      upsertAddress(employeeId, body),
      upsertEmergencyContact(employeeId, body),
      upsertStatutory(employeeId, body),
      upsertFinance(employeeId, body),
      upsertDocuments(employeeId, body),
      upsertSkills(employeeId, body)
    ]);

    const fullResult = await query(
      `SELECT ${EMPLOYEE_COLS}
       FROM employee_master e
       ${EMPLOYEE_JOINS}
       WHERE e.employee_id = $1`,
      [employeeId]
    );

    return Response.json(fullResult.rows[0] || { message: "Employee not found" }, { status: 200 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}