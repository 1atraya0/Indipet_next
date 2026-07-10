const API_BASE_URL = (process.env.NEXT_PUBLIC_HRMS_API_BASE_URL || "").replace(/\/$/, "");

export class HrmsApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "HrmsApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new HrmsApiError(
      "NEXT_PUBLIC_HRMS_API_BASE_URL is not configured.",
      0
    );
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new HrmsApiError(
      payload?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload
    );
  }

  return payload;
}

function listResource(resource, query = {}) {
  const search = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== "")
  );
  return request(`/${resource}${search.size ? `?${search}` : ""}`);
}

function createResource(resource, record) {
  return request(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(record)
  });
}

function updateResource(resource, id, record) {
  return request(`/${resource}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(record)
  });
}

export const hrmsApi = {
  entities: {
    list: query => listResource("entities", query),
    create: record => createResource("entities", record),
    update: (id, record) => updateResource("entities", id, record)
  },
  locations: {
    list: query => listResource("locations", query),
    create: record => createResource("locations", record),
    update: (id, record) => updateResource("locations", id, record),
    operatingHours: {
      list: locationId => listResource(`locations/${encodeURIComponent(locationId)}/operating-hours`),
      save: (locationId, records) =>
        request(`/locations/${encodeURIComponent(locationId)}/operating-hours`, {
          method: "PUT",
          body: JSON.stringify({ records })
        })
    },
    shiftPolicies: locationId => listResource("shift-policies", { location_id: locationId })
  },
  employees: {
    list: query => listResource("employees", query),
    create: record => createResource("employees", record),
    update: (id, record) => updateResource("employees", id, record)
  },
  departments: {
    list: query => listResource("departments", query),
    create: record => createResource("departments", record),
    update: (id, record) => updateResource("departments", id, record)
  },
  designations: {
    list: query => listResource("designations", query),
    create: record => createResource("designations", record),
    update: (id, record) => updateResource("designations", id, record)
  },
  roles: {
    list: query => listResource("roles", query),
    create: record => createResource("roles", record),
    update: (id, record) => updateResource("roles", id, record)
  },
  shiftPolicies: {
    list: query => listResource("shift-policies", query),
    create: record => createResource("shift-policies", record),
    update: (id, record) => updateResource("shift-policies", id, record),
    remove: id => request(`/shift-policies/${encodeURIComponent(id)}`, { method: "DELETE" })
  },
  attendance: {
    dashboard: query => listResource("attendance/dashboard", query),
    list: query => listResource("attendance", query),
    create: record => createResource("attendance", record),
    update: (id, record) => updateResource("attendance", id, record),
  },
  regularization: {
    list: query => listResource("regularization", query),
    create: record => createResource("regularization", record),
    update: (id, record) => updateResource("regularization", id, record),
  },
  shiftExceptions: {
    list: query => listResource("shift-exceptions", query),
    create: record => createResource("shift-exceptions", record),
    update: (id, record) => updateResource("shift-exceptions", id, record),
  },
  coLedger: {
    list: query => listResource("co-ledger", query),
    create: record => createResource("co-ledger", record),
  },
  attendanceReports: {
    list: query => listResource("attendance-reports", query),
    create: record => createResource("attendance-reports", record),
    update: (id, record) => updateResource("attendance-reports", id, record),
  },
  rosters: {
    list: query => listResource("rosters", query),
    get: id => request(`/rosters/${encodeURIComponent(id)}`),
    create: record => createResource("rosters", record),
    update: (id, record) => updateResource("rosters", id, record),
    preview: query => listResource("rosters/preview", query)
  },
  leaveTypes: {
    list: query => listResource("leave-types", query),
    create: record => createResource("leave-types", record),
    update: (id, record) => updateResource("leave-types", id, record)
  },
  leavePolicies: {
    list: query => listResource("leave-policies", query),
    create: record => createResource("leave-policies", record),
    update: (id, record) => updateResource("leave-policies", id, record)
  },
  policyVariants: {
    list: query => listResource("policy-variants", query),
    create: record => createResource("policy-variants", record),
    update: (id, record) => updateResource("policy-variants", id, record)
  },
  policyAssignments: {
    list: query => listResource("policy-assignments", query),
    create: record => createResource("policy-assignments", record),
    update: (id, record) => updateResource("policy-assignments", id, record)
  },
  holidayCalendar: {
    list: query => listResource("holiday-calendar", query),
    create: record => createResource("holiday-calendar", record),
    update: (id, record) => updateResource("holiday-calendar", id, record)
  },
  leaveRequests: {
    list: query => listResource("leave-requests", query),
    create: record => createResource("leave-requests", record),
    update: (id, record) => updateResource("leave-requests", id, record)
  },
  leaveBalances: {
    list: query => listResource("leave-balances", query),
  }
};
