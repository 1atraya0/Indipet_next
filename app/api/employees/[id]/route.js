import { query } from "@/src/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

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

    if (sets.length === 0) {
      return Response.json({ message: "No valid fields to update." }, { status: 400 });
    }

    values.push(Number(id));
    const result = await query(
      `UPDATE employee_master SET ${sets.join(", ")} WHERE employee_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ message: "Employee not found." }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
