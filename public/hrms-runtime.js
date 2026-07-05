/* Migrated from hrms_dashboard_nav_visual.html. */
const attendanceRecords = [];
    let employeeMasterData = [];
    let entityMasterData = [];
    let departmentMasterData = [];
    let designationMasterData = [];
    let roleMasterData = [];
    let leaveTypeData = [];
    let leavePolicyData = [];
    let leaveRequestData = [];
    let attendanceData = [];
    let regularizationData = [];
    let shiftExceptionData = [];
    let coLedgerData = [];

    const keyholderEmployees = [];

    const statusClass = {
      "Present": "green",
      "Approved": "green",
      "Active": "green",
      "Late": "amber",
      "Pending": "amber",
      "Leave": "blue",
      "Posted": "blue",
      "Absent": "red",
      "Rejected": "red",
      "Draft": "grey",
      "Weekly Off": "grey",
      "Inactive": "grey",
      "Override": "purple",
      "Ready": "green",
      "Valid": "green",
      "Configured": "green",
      "Completed": "green",
      "Missing Services": "amber",
      "Missing Hours": "amber",
      "In Progress": "blue",
      "Blocked": "red",
      "Not Generated": "grey",
      "Needs Review": "amber",
      "Ready to Publish": "blue",
      "Published": "green",
      "Superseded": "grey",
      "Cancelled": "red",
      "Open Slots": "amber",
      "Leave Conflict": "amber",
      "Keyholder Missing": "red",
      "Skill Gap": "amber"
    };

    const subLocations = [];

    let parentEntities = {
      IPL101: "Indipet Private Limited",
      SCP102: "South Corona Pet Care",
      PCP103: "Pets & Co Partnership Firm",
      HPR104: "Happy Paws Retail Private Limited"
    };

    const existingLocationRecords = {};

    const weekDays = [
      { dayOfWeek: 1, dayName: "Monday" },
      { dayOfWeek: 2, dayName: "Tuesday" },
      { dayOfWeek: 3, dayName: "Wednesday" },
      { dayOfWeek: 4, dayName: "Thursday" },
      { dayOfWeek: 5, dayName: "Friday" },
      { dayOfWeek: 6, dayName: "Saturday" },
      { dayOfWeek: 7, dayName: "Sunday" }
    ];

    function displayTimeTo24Hour(value) {
      const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return "";
      let hour = Number(match[1]);
      const minute = match[2];
      const period = match[3].toUpperCase();
      if (period === "AM" && hour === 12) hour = 0;
      if (period === "PM" && hour !== 12) hour += 12;
      return `${String(hour).padStart(2, "0")}:${minute}`;
    }

    function displayRangeToTimes(value) {
      const parts = String(value || "").split(" - ");
      return {
        open: displayTimeTo24Hour(parts[0]),
        close: displayTimeTo24Hour(parts[1])
      };
    }

    function buildOperatingHourRecords(location) {
      const official = displayRangeToTimes(location.officialHours);
      const operational = displayRangeToTimes(location.operationalHours);
      const configured = location.hoursConfigured !== false && official.open && official.close && operational.open && operational.close;
      return weekDays.map(day => ({
        dayOfWeek: day.dayOfWeek,
        dayName: day.dayName,
        isOpen: Boolean(configured && location.closedDay !== day.dayName),
        officialOpen: configured ? official.open : "",
        officialClose: configured ? official.close : "",
        operationalOpen: configured ? operational.open : "",
        operationalClose: configured ? operational.close : ""
      }));
    }

    if (subLocations.length) {
      subLocations.forEach(location => {
        location.record = { ...existingLocationRecords[location.id] };
        location.hoursConfigured = true;
        location.operatingHoursRecords = buildOperatingHourRecords(location);
      });
    }

    const pageConfig = {
      "entity-master": { title: "Entity Master", parent: "Organization", description: "Manage Indipet HQ and franchisee legal entities, constitutions and business roles.", action: "Add New Entity", icon: "plus", labels: ["Entities", "Franchisees", "Active Locations"], values: ["0", "0", "0"], columns: ["Entity ID", "Legal Name", "Constitution", "Role", "Status"], rows: [] },
      "location-master": { title: "Location Master", parent: "Organization", description: "Maintain office and store locations, operating status, parent entity and service readiness.", action: "Add Location", icon: "map-pin", labels: ["Locations", "Stores", "HQ Offices"], values: ["0", "0", "0"], columns: ["Location ID", "Location", "Parent Entity", "Type", "Status"], rows: [] },
      "department-master": { title: "Department Master", parent: "Organization", description: "Manage functional departments used by employees, services and reporting.", action: "Add Department", icon: "plus", labels: ["Departments", "Revenue Generating", "Service Linked"], values: ["0", "0", "0"], columns: ["Department Code", "Department Name", "Short Code", "Revenue Centre", "Revenue Gen?", "Status"], rows: [] },
      "designation-master": { title: "Designation Master", parent: "Organization", description: "Control job titles, grade authority, keyholder eligibility and override level.", action: "Add Designation", icon: "plus", labels: ["Designations", "Keyholder Eligible", "Override Enabled"], values: ["0", "0", "0"], columns: ["Designation Code", "Designation Name", "Department", "Grade Code", "Keyholder", "Status"], rows: [] },
      "service-master": genericPage("Service Master", "Organization", "Define services and the skills or departments required to operate them.", "Add Service", ["Services", "Bookable", "Active Locations"], ["Service Code", "Service", "Department", "Staff Requirement", "Status"]),
      "employee-master": { title: "Employee Master", parent: "Employees", description: "View the full employee database, profile completion status, employment details, hierarchy, location and access role from one workspace.", action: "Add Employee", icon: "user-plus", labels: ["Total Employees", "Profile Complete", "Needs Review"], values: ["0", "0", "0"], columns: ["Employee ID", "Employee", "Location", "Designation", "Profile Completion", "Status"], rows: [] },
      "employee-category": genericPage("Employee Category", "Employees", "Maintain statutory skilled, semi-skilled and unskilled employee classifications.", "Add Category", ["Categories", "Employees Mapped", "Wage Rules"], ["Category Code", "Category", "Skill Class", "Employees", "Status"]),
      "skills-certifications": genericPage("Skills & Certifications", "Employees", "Maintain verified employee capabilities used by service booking and roster eligibility.", "Add Skill", ["Skill Records", "Verified", "Expiring Soon"], ["Employee", "Skill", "Level", "Valid Until", "Status"]),
      "shift-preferences": genericPage("Shift Preferences", "Employees", "Manage default shift mode and temporary employee scheduling restrictions.", "Add Preference", ["Flexible", "Fixed Default", "Temporary Rules"], ["Employee", "Mode", "Default Shift", "Effective Until", "Status"]),
      "transfers": genericPage("Transfer History", "Employees", "Review effective-dated employee movement across locations and entities.", "Create Transfer", ["Transfers", "Pending", "This Month"], ["Employee", "From", "To", "Effective Date", "Status"]),
      "leave-requests": genericPage("Leave Requests", "Leave Management", "Review employee leave requests with balance, eligibility and coverage checks.", "New Request", ["Pending", "Approved Today", "Coverage Blocks"], ["Request ID", "Employee", "Leave Type", "Dates", "Status"]),
      "leave-type-master": genericPage("Leave Type Master", "Leave Management", "Manage CL, SL, EL, CO, LOP, maternity and paternity leave definitions.", "Add Leave Type", ["Leave Types", "Paid", "Event Based"], ["Code", "Leave Type", "Paid", "Accrual Type", "Status"]),
      "leave-policy": genericPage("Leave Policy", "Leave Management", "Configure the financial-year leave wrapper and its operational controls.", "Create Policy", ["Policies", "Active", "Assigned Employees"], ["Policy ID", "Policy", "Financial Year", "Variants", "Status"]),
      "policy-variants": genericPage("Policy Variants", "Leave Management", "Define entitlement behaviour for stores, HQ, probation and contractors.", "Add Variant", ["Variants", "Default", "Special Groups"], ["Variant Code", "Variant Name", "Applicable To", "Employees", "Status"]),
      "policy-assignments": genericPage("Policy Assignments", "Leave Management", "Resolve which effective policy variant applies to each group or employee.", "Add Assignment", ["Assignments", "Employee Override", "Conflicts"], ["Assignment ID", "Target Type", "Target", "Variant", "Status"]),
      "holiday-calendar": genericPage("Holiday Calendar", "Leave Management", "Maintain the uniform West Bengal calendar and closed holiday decisions.", "Add Holiday", ["FY Holidays", "Store Closed", "CO Eligible"], ["Date", "Holiday", "Scope", "Store Closed", "Status"]),
      "operating-hours": genericPage("Operating Hours", "Shift & Roster", "Manage official and operational hours for offices and retail stores.", "Add Hours", ["Locations", "Open Today", "Closed Today"], ["Location", "Official Hours", "Operational Hours", "Week Off", "Status"]),
      "shift-policy": genericPage("Shift Policy", "Shift & Roster", "Configure shift timing, required staff, keyholder and weekly-off rules.", "Add Shift Policy", ["Policies", "Store Shifts", "HQ Shifts"], ["Policy ID", "Shift", "Location", "Timing", "Status"]),
      "roster": genericPage("Roster Control Center", "Roster", "Overview of all locations and their roster status.", "Generate Roster", ["Total Locations", "Published Rosters", "Draft Rosters", "Open Slots", "Needs Review"], ["Location", "Roster Period", "Roster Version", "Roster Status", "Filled Slots", "Open Slots", "Conflicts", "Keyholder Coverage", "Last Updated"]),
      "roster-board-menu": genericPage("Roster Board", "Shift & Roster", "Open a location roster from the Roster Control Center.", "Open Board", ["Locations", "Published", "Needs Review"], ["Location", "Roster Period", "Version", "Status", "Action"]),
      "roster-slots": genericPage("Open Slots", "Shift & Roster", "Review unassigned roster requirements created during roster generation.", "Add Slot", ["Open Slots", "Skill Gaps", "Keyholder Gaps"], ["Date", "Location", "Shift", "Required Skill", "Status"]),
      "roster-history": genericPage("Roster History", "Shift & Roster", "Review immutable roster versions, overrides, approvals and publication events.", "Export History", ["Versions", "Overrides", "Superseded"], ["Version", "Location", "Changed By", "Published At", "Status"]),
      "attendance-list": genericPage("Attendance List", "Attendance", "Review raw attendance, roster linkage, computation and final payable status.", "Add Attendance", ["Present", "Late", "Absent"], ["Employee", "Location", "Shift", "Hours", "Status"]),
      "regularization": genericPage("Regularization Requests", "Attendance", "Approve missing punch and attendance correction requests with evidence.", "New Request", ["Pending", "Approved Today", "Rejected"], ["Request ID", "Employee", "Issue", "Requested At", "Status"]),
      "shift-exceptions": genericPage("Shift Exceptions", "Attendance", "Monitor late, early exit, missed punch and roster mismatch exceptions.", "Review Exceptions", ["Open", "Critical", "Resolved Today"], ["Employee", "Exception", "Roster Slot", "Detected At", "Status"]),
      "co-ledger": genericPage("CO Ledger", "Attendance", "Track compensatory-off credits, use, expiry and attendance source.", "Manual Credit", ["Available Units", "Expiring Soon", "Used This Month"], ["Employee", "Entry Type", "Units", "Expiry", "Status"]),
      "attendance-reports": genericPage("Attendance Reports", "Attendance", "Prepare location, employee and exception reports from approved decisions.", "Generate Report", ["Saved Reports", "Scheduled", "Last Run"], ["Report", "Scope", "Period", "Owner", "Status"]),
      "salary-structure": genericPage("Salary Structure", "Payroll & Compliance", "Maintain grade-wise salary components and effective-dated structures.", "Add Structure", ["Structures", "Employees Mapped", "Pending Approval"], ["Structure", "Grade", "Basic", "Gross", "Status"]),
      "payroll-period": genericPage("Payroll Period", "Payroll & Compliance", "Control payroll month, cut-off, processing and finalisation status.", "Open Period", ["Current Period", "Exceptions", "Cut-off"], ["Period", "Employee Count", "Cut-off", "Run Status", "Status"]),
      "payroll-run": genericPage("Payroll Run", "Payroll & Compliance", "Process authoritative attendance, leave, compensation and compliance inputs.", "Run Payroll", ["Employees", "Ready", "Blocked"], ["Run ID", "Period", "Employees", "Gross Payroll", "Status"]),
      "minimum-wage": genericPage("Minimum Wage", "Payroll & Compliance", "Maintain West Bengal minimum wage controls by statutory category.", "Add Wage Rule", ["Rules", "Categories", "Breaches"], ["State", "Category", "Effective From", "Monthly Wage", "Status"]),
      "state-compliance": genericPage("State Compliance", "Payroll & Compliance", "Manage state-wise PT, ESIC and other payroll applicability rules.", "Add Rule", ["States", "Active Rules", "Pending Review"], ["State", "Rule", "Effective From", "Owner", "Status"]),
      "approvals": genericPage("Approval Queue", "Audit & Administration", "Review leave, roster, attendance and payroll decisions awaiting authority.", "Review Queue", ["Pending", "High Priority", "Due Today"], ["Request", "Module", "Submitted By", "Age", "Status"]),
      "audit-log": genericPage("Audit Log", "Audit & Administration", "Search actor, timestamp, reason and version history across HRMS modules.", "Export Audit", ["Events Today", "Overrides", "High Risk"], ["Timestamp", "Actor", "Module", "Action", "Status"]),
      "role-manager": { title: "Role Master", parent: "Organization", description: "Manage application permissions separately from designation grade authority.", action: "Add Role", icon: "plus", labels: ["Roles", "Permission Sets", "Users"], values: ["0", "0", "0"], columns: ["Role Code", "Role Name", "Status", "Permission Sets"], rows: [] },
      "system-settings": genericPage("System Settings", "Audit & Administration", "Manage controlled configuration, notifications and integration behaviour.", "Add Setting", ["Settings", "Integrations", "Warnings"], ["Setting", "Category", "Value", "Changed By", "Status"]),
      "support": genericPage("Help & Support", "Control", "Find process guidance, operating handbooks and developer support resources.", "Create Ticket", ["Open Tickets", "Knowledge Articles", "System Status"], ["Resource", "Category", "Updated", "Owner", "Status"])
    };

    function genericPage(title, parent, description, action, labels, columns) {
      const values = labels.map(() => "0");
      return { title, parent, description, action, icon: "plus", labels, values, columns, rows: [] };
    }

    const weeklyData = [];

    let activePage = "dashboard";
    let attendancePage = 1;
    let selectedLocationId = "SCP102-LKG203";
    let activeLocationTab = "hours";
    let locationFormMode = "create";
    let editingLocationId = null;
    let hoursEditMode = false;
    let hoursDraft = null;
    let shiftPolicyKeyholderRequired = true;
    let rosterGeneratedSetup = null;
    let publishedRosters = [];
    let departmentFormMode = "create";
    let editingDepartmentId = null;
    let designationFormMode = "create";
    let editingDesignationId = null;
    let roleFormMode = "create";
    let editingRoleId = null;
    let entityFormMode = "create";
    let editingEntityId = null;
    let employeeFormMode = "create";
    let editingEmployeeId = null;
    let leaveTypeFormMode = "create";
    let editingLeaveTypeId = null;
    let leavePolicyFormMode = "create";
    let editingLeavePolicyId = null;
    let leaveRequestFormMode = "create";
    let editingLeaveRequestId = null;
    let attendanceFormMode = "create";
    let editingAttendanceId = null;
    let regularizationFormMode = "create";
    let editingRegularizationId = null;
    let shiftExceptionFormMode = "create";
    let editingShiftExceptionId = null;
    let coLedgerFormMode = "create";
    let editingCoLedgerId = null;
    let rosterGeneratedResult = null;
    let activeRosterBoardTab = "board";
    let currentRosterBoardRecord = null;
    let currentRosterBoardLocation = null;
    let currentPublishedRosterData = null;
    let publishedRosterDirty = false;
    let activeLocationStep = 0;
    let activeEntityStep = 0;
    let activeEmployeeStep = 0;
    let selectedEntityId = null;
    let selectedDepartmentId = null;
    let selectedDesignationId = null;
    let selectedRoleId = null;
    let selectedEmployeeId = null;
    const attendancePageSize = 6;

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    function refreshIcons() {
      if (window.lucide) lucide.createIcons();
    }

    function renderWeeklyChart(multiplier = 1) {
      $("#weeklyChart").innerHTML = weeklyData.map(item => {
        const total = Math.round((item.present + item.leave + item.absent) * multiplier);
        const present = Math.round(item.present * multiplier);
        const leave = Math.round(item.leave * multiplier);
        const absent = Math.max(1, total - present - leave);
        return `
          <div class="chart-column" title="${item.day}: ${present} present, ${leave} leave, ${absent} absent">
            <div class="bar-stack" style="height:${Math.min(94, total)}%">
              <span class="bar present" style="height:${present}%"></span>
              <span class="bar leave" style="height:${leave}%"></span>
              <span class="bar absent" style="height:${absent}%"></span>
            </div>
            <span class="chart-label">${item.day}</span>
          </div>
        `;
      }).join("");
    }

    function renderAttendance() {
      const card = $("#dashboardView .table-card");
      const query = $(".record-search", card).value.trim().toLowerCase();
      const location = $(".location-filter", card).value;
      const status = $(".status-filter", card).value;
      const filtered = attendanceRecords.filter(record => {
        const matchesText = !query || `${record.name} ${record.id}`.toLowerCase().includes(query);
        const matchesLocation = location === "all" || record.location === location;
        const matchesStatus = status === "all" || record.status === status;
        return matchesText && matchesLocation && matchesStatus;
      });
      const pages = Math.max(1, Math.ceil(filtered.length / attendancePageSize));
      attendancePage = Math.min(attendancePage, pages);
      const start = (attendancePage - 1) * attendancePageSize;
      const visible = filtered.slice(start, start + attendancePageSize);

      $(".records-body", card).innerHTML = visible.map(record => `
        <tr data-record-id="${record.id}">
          <td class="checkbox-cell"><input class="row-checkbox" type="checkbox" aria-label="Select ${record.name}"></td>
          <td>
            <div class="employee-cell">
              <span class="employee-avatar">${record.initials}</span>
              <span><span class="cell-primary">${record.name}</span><span class="cell-secondary">${record.id}</span></span>
            </div>
          </td>
          <td>${record.location}</td>
          <td>${record.shift}</td>
          <td>${record.checkIn}</td>
          <td>${record.checkOut}</td>
          <td><span class="badge ${statusClass[record.status] || "grey"}">${record.status}</span></td>
          <td class="action-cell">
            <div class="row-menu-wrap">
              <button class="row-menu-button" aria-label="Actions for ${record.name}"><i data-lucide="ellipsis"></i></button>
              <div class="row-menu">
                <button data-row-action="view"><i data-lucide="eye"></i>View details</button>
                <button data-row-action="edit"><i data-lucide="pencil"></i>Correct record</button>
                <button data-row-action="history"><i data-lucide="history"></i>View history</button>
              </div>
            </div>
          </td>
        </tr>
      `).join("");

      $(".empty-state", card).classList.toggle("is-visible", filtered.length === 0);
      $("table", card).style.display = filtered.length ? "table" : "none";
      $(".range-start", card).textContent = filtered.length ? start + 1 : 0;
      $(".range-end", card).textContent = Math.min(start + attendancePageSize, filtered.length);
      $(".range-total", card).textContent = filtered.length;
      $(".page-prev", card).disabled = attendancePage === 1;
      $(".page-next", card).disabled = attendancePage === pages;
      const numberButtons = $$(".page-buttons .page-button:not(.page-prev):not(.page-next)", card);
      numberButtons.forEach((button, index) => {
        button.textContent = index + 1;
        button.style.display = index < pages ? "grid" : "none";
        button.classList.toggle("is-current", attendancePage === index + 1);
      });
      $(".select-all", card).checked = false;
      updateBulkBar(card);
      refreshIcons();
    }

    function updateBulkBar(card) {
      const selected = $$(".row-checkbox:checked", card).length;
      $(".bulk-bar", card).classList.toggle("is-visible", selected > 0);
      $(".bulk-count", card).textContent = `${selected} record${selected === 1 ? "" : "s"} selected`;
      $$("tbody tr", card).forEach(row => {
        row.classList.toggle("is-selected", $(".row-checkbox", row)?.checked);
      });
    }

    function setSelectOptions(select, options, selectedValue = "all") {
      select.innerHTML = options.map(option => `
        <option value="${option.value}" ${option.value === selectedValue ? "selected" : ""}>${option.label}</option>
      `).join("");
    }

    function restoreGenericModuleFilters() {
      const module = $("#moduleView");
      module.classList.remove("roster-control-view", "roster-board-view");
      const rosterTabBar = $(".roster-tab-bar", module);
      if (rosterTabBar) rosterTabBar.remove();
      $(".filter-bar", module).style.display = "";
      $(".table-wrap", module).classList.remove("roster-board-table-wrap");
      $(".filter-bar", module).innerHTML = `
        <div class="table-search">
          <i data-lucide="search"></i>
          <input id="moduleSearch" type="search" placeholder="Search records">
        </div>
        <select class="filter-select" id="moduleLocation"></select>
        <select class="filter-select" id="moduleStatus"></select>
        <button class="button" id="moduleReset"><i data-lucide="rotate-ccw"></i>Reset</button>
      `;
      $("#moduleSearch").addEventListener("input", () => renderModule(activePage));
      $("#moduleLocation").addEventListener("change", () => renderModule(activePage));
      $("#moduleStatus").addEventListener("change", () => renderModule(activePage));
      $("#moduleReset").addEventListener("click", () => {
        if (activePage === "roster") {
          $("#rosterPeriodFilter") && ($("#rosterPeriodFilter").value = "all");
          $("#rosterIssueFilter") && ($("#rosterIssueFilter").value = "all");
        }
        $("#moduleSearch").value = "";
        $("#moduleLocation").value = "all";
        $("#moduleStatus").value = "all";
        renderModule(activePage);
      });
      $(".table-search", module).style.display = "";
      $("#moduleSearch").placeholder = "Search records";
      setSelectOptions($("#moduleLocation"), [
        { value: "all", label: "All Locations" },
        ...subLocations.map(location => ({ value: location.listName, label: location.listName }))
      ]);
      setSelectOptions($("#moduleStatus"), [
        { value: "all", label: "All Statuses" },
        { value: "Active", label: "Active" },
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Draft", label: "Draft" },
        { value: "Inactive", label: "Inactive" }
      ]);
      $("#rosterPeriodFilter")?.remove();
      $("#rosterIssueFilter")?.remove();
      $("#columnButton").style.display = "";
      $("#moduleReset").style.display = "";
      $(".pagination", module).style.display = "";
      $(".pagination", module).innerHTML = `
        <div class="pagination-copy">Showing <span id="moduleCount">0</span> records</div>
        <div class="page-buttons">
          <button class="page-button" disabled><i data-lucide="chevron-left"></i></button>
          <button class="page-button is-current">1</button>
          <button class="page-button" disabled><i data-lucide="chevron-right"></i></button>
        </div>
      `;
      $(".table-wrap", module).innerHTML = `
        <table>
          <thead id="moduleTableHead"></thead>
          <tbody id="moduleTableBody"></tbody>
        </table>
        <div class="empty-state" id="moduleEmpty">
          <i data-lucide="inbox"></i>
          <div class="empty-title">No matching records</div>
          <div class="empty-copy">Try changing the current filters.</div>
        </div>
      `;
    }

    function rosterOverviewRecords() {
      const week = defaultRosterWeek();
      const period = `${formatShortDate(week.start)} – ${formatShortDate(week.end)}`;
      return subLocations.map(location => {
        const activeShifts = (location.shifts || []).filter(s => s[5] === "Active");
        const shiftCount = activeShifts.length;
        const totalSanctioned = activeShifts.reduce((sum, s) => sum + Number(s[3] || 0), 0);
        const hasKeyholder = activeShifts.some(s => s[13] === "Yes");
        return {
          rosterId: "",
          period: period,
          version: "-",
          status: shiftCount ? "Not Generated" : "No Policy",
          filled: 0,
          open: totalSanctioned,
          conflicts: 0,
          keyholder: hasKeyholder ? "Configured" : "Not Configured",
          updated: "-",
          issue: shiftCount ? "No Data" : "Needs Shift Policy",
          locationId: location.id,
          locationName: location.listName,
          displayName: location.name,
          activeShifts: activeShifts
        };
      });
    }

    function ensureRosterFilters() {
      const module = $("#moduleView");
      module.classList.remove("roster-board-view");
      module.classList.add("roster-control-view");
      $(".filter-bar", module).style.display = "";
      $(".table-wrap", module).classList.remove("roster-board-table-wrap");
      $("#columnButton").style.display = "none";
      $(".filter-bar", module).innerHTML = `
        <div class="roster-filter-field">
          <label for="rosterPeriodFilter">Roster Period</label>
          <select class="filter-select" id="rosterPeriodFilter">
            <option value="${(() => { const w = defaultRosterWeek(); return formatShortDate(w.start) + ' \u2013 ' + formatShortDate(w.end); })()}">${(() => { const w = defaultRosterWeek(); return formatShortDate(w.start) + ' \u2013 ' + formatShortDate(w.end); })()}</option>
            <option value="all">All Periods</option>
            <option value="June 2026">June 2026</option>
          </select>
        </div>
        <div class="roster-filter-field">
          <label for="moduleLocation">Location</label>
          <select class="filter-select" id="moduleLocation">
            <option value="all">All Locations</option>
            ${subLocations.map(location => `<option value="${location.id}">${location.listName}</option>`).join("")}
          </select>
        </div>
        <div class="roster-filter-field">
          <label for="moduleStatus">Roster Status</label>
          <select class="filter-select" id="moduleStatus">
            <option value="all">All Statuses</option>
            <option value="Not Generated">Not Generated</option>
            <option value="Draft">Draft</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Ready to Publish">Ready to Publish</option>
            <option value="Published">Published</option>
            <option value="Superseded">Superseded</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div class="roster-filter-field">
          <label for="rosterIssueFilter">Issue Type</label>
          <select class="filter-select" id="rosterIssueFilter">
            <option value="all">All Issue Types</option>
            <option value="Open Slots">Open Slots</option>
            <option value="Leave Conflict">Leave Conflict</option>
            <option value="Keyholder Issue">Keyholder Issue</option>
            <option value="Skill Gap">Skill Gap</option>
            <option value="Pending Publish">Pending Publish</option>
          </select>
        </div>
        <button class="button roster-filter-button" id="rosterFilterButton" type="button"><i data-lucide="filter"></i>Filters</button>
        <button class="button roster-reset-button" id="moduleReset" type="button">Reset</button>
      `;
      $("#rosterPeriodFilter").addEventListener("change", () => renderRosterControlCenter());
      $("#moduleLocation").addEventListener("change", () => renderRosterControlCenter());
      $("#moduleStatus").addEventListener("change", () => renderRosterControlCenter());
      $("#rosterIssueFilter").addEventListener("change", () => renderRosterControlCenter());
      $("#rosterFilterButton").addEventListener("click", () => showToast("Roster filters are applied to the overview."));
      $("#moduleReset").addEventListener("click", () => {
        const defaultPeriod = (() => { const w = defaultRosterWeek(); return formatShortDate(w.start) + ' \u2013 ' + formatShortDate(w.end); })();
        $("#rosterPeriodFilter").value = defaultPeriod;
        $("#moduleLocation").value = "all";
        $("#moduleStatus").value = "all";
        $("#rosterIssueFilter").value = "all";
        renderRosterControlCenter();
      });
    }

    let rosterControlTab = "overview";

    function renderRosterTabBar() {
      const existing = $(".roster-tab-bar", $("#moduleView"));
      if (existing) existing.remove();
      const bar = document.createElement("div");
      bar.className = "roster-tab-bar";
      bar.innerHTML = `
        <button class="roster-tab ${rosterControlTab === "overview" ? "is-active" : ""}" data-roster-control-tab="overview" type="button">
          <i data-lucide="layout-dashboard"></i>Overview
        </button>
        <button class="roster-tab ${rosterControlTab === "published" ? "is-active" : ""}" data-roster-control-tab="published" type="button">
          <i data-lucide="circle-check"></i>Published Rosters
        </button>`;
      const filterBar = $(".filter-bar", $("#moduleView"));
      if (filterBar) {
        filterBar.parentNode.insertBefore(bar, filterBar);
      } else {
        $("#moduleView").insertBefore(bar, $("#moduleView").firstChild);
      }
    }

    async function renderRosterControlCenter() {
      const module = $("#moduleView");
      module.classList.remove("roster-board-view");
      module.classList.add("roster-control-view");
      renderRosterTabBar();

      if (rosterControlTab === "published") {
        await renderRosterPublishedRosters();
        return;
      }

      ensureRosterFilters();

      const defaultPeriod = (() => { const w = defaultRosterWeek(); return formatShortDate(w.start) + ' \u2013 ' + formatShortDate(w.end); })();
      const previousPeriod = $("#rosterPeriodFilter")?.value || defaultPeriod;
      const previousLocation = $("#moduleLocation")?.value || "all";
      const previousStatus = $("#moduleStatus")?.value || "all";
      const previousIssue = $("#rosterIssueFilter")?.value || "all";
      if ($("#rosterPeriodFilter")) $("#rosterPeriodFilter").value = previousPeriod;
      if ($("#moduleLocation")) $("#moduleLocation").value = previousLocation;
      if ($("#moduleStatus")) $("#moduleStatus").value = previousStatus;
      if ($("#rosterIssueFilter")) $("#rosterIssueFilter").value = previousIssue;
      const period = $("#rosterPeriodFilter")?.value || "all";
      const locationId = $("#moduleLocation").value;
      const status = $("#moduleStatus").value;
      const issue = $("#rosterIssueFilter")?.value || "all";
      const records = rosterOverviewRecords().filter(record =>
        (period === "all" || record.period === period) &&
        (locationId === "all" || record.locationId === locationId) &&
        (status === "all" || record.status === status) &&
        (issue === "all" || record.issue === issue)
      );
      const all = rosterOverviewRecords();
      const totalLocations = all.length;
      const published = all.filter(r => r.status === "Published").length;
      const draft = all.filter(r => r.status === "Draft").length;
      const openSlots = all.reduce((sum, r) => sum + r.open, 0);
      const needsReview = all.filter(r => r.status === "Needs Review").length;
      const summary = [
        ["Total Locations", String(totalLocations), `${totalLocations} locations`, "building-2", "blue"],
        ["Published Rosters", String(published), totalLocations ? `${Math.round(published / totalLocations * 100)}% of locations` : "0%", "circle-check", "green"],
        ["Draft Rosters", String(draft), totalLocations ? `${Math.round(draft / totalLocations * 100)}% of locations` : "0%", "file-text", "amber"],
        ["Open Slots", String(openSlots), `${openSlots} slots across all locations`, "user-round-x", "red"],
        ["Needs Review", String(needsReview), `${needsReview} location${needsReview !== 1 ? "s" : ""} with issues`, "triangle-alert", "purple"]
      ];
      $("#moduleSummary").innerHTML = summary.map(item => `
        <article class="card summary-card roster-summary-card">
          <span class="roster-summary-icon ${item[4]}"><i data-lucide="${item[3]}"></i></span>
          <div>
            <div class="summary-label">${item[0]}</div>
            <div class="summary-value">${item[1]}</div>
            <div class="summary-note">${item[2]}</div>
          </div>
        </article>
      `).join("");
      $("#moduleTableTitle").textContent = "Location Roster Overview";
      $("#moduleTableSubtitle").textContent = "Which locations have rosters, what state they are in, and where review is needed.";
      $("#moduleTableHead").innerHTML = `
        <tr>
          <th>Location</th><th>Roster Period</th><th>Roster Version</th><th>Roster Status</th>
          <th>Filled Slots</th><th>Open Slots</th><th>Conflicts</th><th>Keyholder Coverage</th><th>Last Updated</th><th class="action-cell">Action</th>
        </tr>`;
      $("#moduleTableBody").innerHTML = records.map(record => {
        const primaryAction = record.status === "Not Generated" || record.status === "No Policy"
          ? "Generate"
          : record.status === "Ready to Publish"
            ? "Publish"
            : "View";
        const primaryClass = primaryAction === "Publish" ? "action-primary publish" : "action-primary";
        return `
          <tr data-roster-id="${record.rosterId}" data-location-id="${record.locationId}">
            <td><span class="roster-location-name">${record.locationName}</span><span class="roster-location-code">${record.locationId}</span></td>
            <td>${record.period}</td>
            <td>${record.version}</td>
            <td><span class="badge ${statusClass[record.status] || "grey"}">${record.status}</span></td>
            <td>${record.filled}</td>
            <td><span class="badge ${record.open ? "amber" : "grey"} roster-count-chip">${record.open}</span></td>
            <td><span class="badge ${record.conflicts ? "red" : "grey"} roster-count-chip">${record.conflicts}</span></td>
            <td><span class="badge ${statusClass[record.keyholder] || "grey"}">${record.keyholder}</span></td>
            <td>${record.updated}</td>
            <td class="action-cell roster-action-cell">
              <button class="button ${primaryClass} roster-row-primary" data-roster-primary="${primaryAction.toLowerCase()}" data-roster-id="${record.rosterId}" data-location-id="${record.locationId}" type="button">${primaryAction}</button>
              <button class="action-more" data-roster-more="${record.locationId}" aria-label="More roster actions for ${record.locationName}" type="button"><i data-lucide="ellipsis-vertical"></i></button>
            </td>
          </tr>
        `;
      }).join("");
      $("#moduleEmpty").classList.toggle("is-visible", records.length === 0);
      $("#moduleTableBody").closest("table").style.display = records.length ? "table" : "none";
      const mc = $("#moduleCount");
      if (mc) mc.textContent = records.length;
      const pag = $(".pagination", $("#moduleView"));
      if (pag) {
        pag.style.display = "";
        pag.innerHTML = `
          <div class="pagination-copy">Showing <span id="moduleCount">${records.length}</span> of ${all.length} locations</div>
          <div class="page-buttons">
            <button class="page-button" disabled><i data-lucide="chevron-left"></i></button>
            <button class="page-button is-current">1</button>
            <button class="page-button" disabled><i data-lucide="chevron-right"></i></button>
            <select class="pagination-page-size" aria-label="Rows per page">
              <option>10 / page</option>
              <option>25 / page</option>
            </select>
          </div>
        `;
      }
      refreshIcons();
    }

    async function renderRosterPublishedRosters() {
      const module = $("#moduleView");
      const filterBar = $(".filter-bar", module);
      if (filterBar) {
        filterBar.innerHTML = "";
        filterBar.style.display = "none";
      }
      $(".table-wrap", module).classList.remove("roster-board-table-wrap");
      $("#columnButton").style.display = "none";
      $(".pagination", module).style.display = "none";

      const api = window.IndipetHRMS?.api;
      if (api) {
        try {
          publishedRosters = await api.rosters.list();
        } catch (err) {
          console.error("Failed to fetch published rosters from server:", err);
        }
      }
      const published = publishedRosters.slice();

      $("#moduleSummary").innerHTML = `
        <article class="card summary-card roster-summary-card">
          <span class="roster-summary-icon green"><i data-lucide="circle-check"></i></span>
          <div>
            <div class="summary-label">Published Rosters</div>
            <div class="summary-value">${published.length}</div>
            <div class="summary-note">${published.length ? `${published.length} roster${published.length > 1 ? "s" : ""} currently published` : "No rosters published yet"}</div>
          </div>
        </article>
        <article class="card summary-card roster-summary-card">
          <span class="roster-summary-icon blue"><i data-lucide="history"></i></span>
          <div>
            <div class="summary-label">Superseded</div>
            <div class="summary-value">${publishedRosters.filter(r => r.status === "Superseded").length}</div>
            <div class="summary-note">Older versions replaced by newer publishes</div>
          </div>
        </article>
      `;

      $("#moduleTableTitle").textContent = "Published Rosters";
      $("#moduleTableSubtitle").textContent = "View and edit published rosters for any location and period.";
      $("#moduleTableHead").innerHTML = `
        <tr>
          <th>Location</th><th>Roster Period</th><th>Version</th><th>Status</th>
          <th>Filled Slots</th><th>Open Slots</th><th>Conflicts</th><th>Published On</th><th class="action-cell">Actions</th>
        </tr>`;

      if (published.length === 0) {
        $("#moduleTableBody").innerHTML = `
          <tr>
            <td colspan="9">
              <div class="roster-panel-empty">
                <i data-lucide="file-text"></i>
                <span>No published rosters yet</span>
                <small>Generate and publish a roster from the Overview tab to see it here.</small>
              </div>
            </td>
          </tr>`;
        $("#moduleEmpty").classList.add("is-visible");
        $("#moduleTableBody").closest("table").style.display = "table";
        const mc0 = $("#moduleCount");
        if (mc0) mc0.textContent = "0";
        refreshIcons();
        return;
      }

      $("#moduleTableBody").innerHTML = published.map(record => `
        <tr data-roster-id="${record.rosterId}" data-location-id="${record.locationId}">
          <td><span class="roster-location-name">${record.locationName}</span><span class="roster-location-code">${record.locationId}</span></td>
          <td>${record.period}</td>
          <td>${record.version}</td>
          <td><span class="badge ${statusClass[record.status] || "grey"}">${record.status}</span></td>
          <td>${record.filled}</td>
          <td><span class="badge ${record.open ? "amber" : "grey"} roster-count-chip">${record.open}</span></td>
          <td><span class="badge ${record.conflicts ? "red" : "grey"} roster-count-chip">${record.conflicts}</span></td>
          <td>${record.updated}</td>
          <td class="action-cell roster-action-cell">
            <button class="button roster-published-view" data-roster-view="${record.rosterId}" data-roster-location="${record.locationId}" type="button"><i data-lucide="eye"></i>View</button>
            <button class="button primary roster-published-edit" data-roster-view="${record.rosterId}" data-roster-location="${record.locationId}" type="button"><i data-lucide="pencil"></i>Edit</button>
          </td>
        </tr>
      `).join("");

      $("#moduleEmpty").classList.remove("is-visible");
      $("#moduleTableBody").closest("table").style.display = "table";
      const mc1 = $("#moduleCount");
      if (mc1) mc1.textContent = published.length;
      refreshIcons();
    }

    function rosterBoardEmployees(location) {
      const config = pageConfig["employee-master"];
      if (!config?.rows) return [];
      return config.rows
        .filter(row => row[2] === location.listName || row[2] === location.name)
        .map(row => [row[0], row[1], row[3] || "", ""]);
    }

    function parseRosterPeriod(period) {
      const normalized = String(period || "")
        .replace(/â€“/g, "-")
        .replace(/[–—]/g, "-")
        .replace(/\s+-\s+/g, " - ");
      const match = normalized.match(/(\d{1,2})\s+([A-Za-z]{3})(?:\s+\d{4})?\s+-\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
      if (!match) return null;
      const monthIndex = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const startMonth = monthIndex[match[2].toLowerCase()];
      const endMonth = monthIndex[match[4].toLowerCase()];
      const year = Number(match[5]);
      if (startMonth === undefined || endMonth === undefined || !year) return null;
      return {
        start: new Date(year, startMonth, Number(match[1])),
        end: new Date(year, endMonth, Number(match[3]))
      };
    }

    function rosterBoardDates(period) {
      const parsed = parseRosterPeriod(period);
      if (!parsed) return [];
      const dates = [];
      const cursor = new Date(parsed.start);
      while (cursor <= parsed.end && dates.length < 31) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1;
        const day = cursor.getDate();
        dates.push({
          day,
          label: cursor.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
          dayName: cursor.toLocaleDateString("en-GB", { weekday: "short" }),
          monthLabel: cursor.toLocaleDateString("en-GB", { month: "short" }),
          year,
          iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      return dates;
    }

    function employeeInitials(name) {
      return String(name || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || "")
        .join("") || "EP";
    }

    function isRosterEmployeeKeyholder(employeeId, locationId) {
      return keyholderEmployees.some(employee =>
        employee.id === employeeId &&
        employee.locationId === locationId &&
        employee.status === "Active" &&
        employee.keyholderEligible
      );
    }

    function renderRosterCell(employeeIndex, dayIndex, activeShifts, employee, date) {
      const cellContext = `data-roster-cell="true" data-employee-name="${employee[1]}" data-roster-date="${date.label} ${date.year}"`;
      return `<div class="roster-cell open" ${cellContext}><strong>Open Slot</strong><span>Unassigned</span></div>`;
    }

    function renderRosterBoardActions(record, location, activeShifts) {
      const hasActiveShifts = activeShifts.length > 0;
      const canPublish = record.status === "Ready to Publish" && record.open === 0 && record.conflicts === 0;
      const actionTitle = record.status === "Not Generated"
        ? "Create the first roster draft"
        : record.status === "Published"
          ? "Published roster is read-only"
          : "Update roster draft";
      const actionNote = !hasActiveShifts
        ? "No active Location Shift Policy is available. Activate shift policy before generating a usable roster."
        : record.status === "Published"
          ? "Create a revision before changing employee slots or open slots."
          : "Use these actions to edit open slots, regenerate the draft, publish, export or inspect history.";
      const primaryAction = record.status === "Published"
        ? `<button class="button primary" data-roster-board-action="revision" data-location-id="${location.id}" type="button"><i data-lucide="git-branch"></i>Create Revision / Edit</button>`
        : record.status === "Not Generated"
          ? `<button class="button primary" data-roster-board-action="generate" data-location-id="${location.id}" type="button" ${hasActiveShifts ? "" : "disabled"}><i data-lucide="wand-sparkles"></i>Generate Draft</button>`
          : `<button class="button primary" data-roster-board-action="edit" data-location-id="${location.id}" type="button"><i data-lucide="pencil"></i>Edit Roster Draft</button>`;
      return `
        ${hasActiveShifts ? "" : `
          <div class="roster-board-alert">
            <i data-lucide="triangle-alert"></i>
            <div>
              <strong>Roster cannot be generated properly yet.</strong><br>
              This location has no active shift policy. Activate Location Shift Policy first, otherwise the board can only show open slots.
            </div>
          </div>
        `}
        <div class="roster-board-actions">
          <div class="roster-board-action-copy">
            <div class="roster-board-action-title">${actionTitle}</div>
            <div class="roster-board-action-note">${actionNote}</div>
          </div>
          <div class="roster-board-action-buttons">
            ${primaryAction}
            <button class="button" data-roster-board-action="open-slot" data-location-id="${location.id}" type="button" ${record.status === "Published" ? "disabled" : ""}><i data-lucide="user-plus"></i>Add Employee to Open Slot</button>
            <button class="button" data-roster-board-action="publish" data-location-id="${location.id}" type="button" ${canPublish ? "" : "disabled"}><i data-lucide="send"></i>Publish</button>
            <button class="button" data-roster-board-action="export" data-location-id="${location.id}" type="button"><i data-lucide="download"></i>Export</button>
            <button class="button" data-roster-board-action="history" data-location-id="${location.id}" type="button"><i data-lucide="history"></i>History</button>
            ${hasActiveShifts ? "" : `<button class="button" data-roster-board-action="shift-policy" data-location-id="${location.id}" type="button"><i data-lucide="clock-3"></i>Open Shift Policy</button>`}
          </div>
        </div>
      `;
    }

    function openRosterBoard(rosterId, locationId) {
      const record = rosterOverviewRecords().find(item => rosterId && item.rosterId === rosterId)
        || rosterOverviewRecords().find(item => item.locationId === locationId)
        || rosterOverviewRecords()[0];
      const location = subLocations.find(item => item.id === locationId) || subLocations[0];
      activePage = "roster-board";
      activeRosterBoardTab = "board";
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      const rosterNav = $('.nav-single[data-page="roster"], .nav-child[data-page="roster"]');
      if (rosterNav) {
        rosterNav.classList.add("is-active");
        const rosterGroup = rosterNav.closest(".nav-group");
        if (rosterGroup) openGroup(rosterGroup, true);
      }
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#locationFormView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#employeeFormView").classList.remove("is-active");
      $("#moduleView").classList.add("is-active");
      setPageHeader("Roster", `${location.listName} Roster Board`, "View and manage the monthly roster for this location.", "Back to Roster", "arrow-left");
      renderRosterBoard(record, location);
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    async function openRosterBoardPublished(rosterId, locationId) {
      const location = subLocations.find(item => item.id === locationId) || subLocations[0];
      activePage = "roster-board";
      activeRosterBoardTab = "board";
      publishedRosterDirty = false;
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      const rosterNav = $('.nav-single[data-page="roster"], .nav-child[data-page="roster"]');
      if (rosterNav) {
        rosterNav.classList.add("is-active");
        const rosterGroup = rosterNav.closest(".nav-group");
        if (rosterGroup) openGroup(rosterGroup, true);
      }
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#locationFormView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#employeeFormView").classList.remove("is-active");
      $("#moduleView").classList.add("is-active");
      setPageHeader("Roster", `${location.listName} Roster Board`, "View and manage the monthly roster for this location.", "Back to Roster", "arrow-left");

      let rosterData = null;
      const api = window.IndipetHRMS?.api;
      if (api) {
        try {
          rosterData = await api.rosters.get(rosterId);
        } catch (err) {
          console.error("Failed to fetch published roster:", err);
        }
      }
      if (!rosterData) {
        const cached = publishedRosters.find(r => r.rosterId === rosterId);
        if (cached) rosterData = cached;
      }
      if (!rosterData) {
        showToast("Could not load roster data.");
        return;
      }
      renderRosterBoardFromData(rosterData, location);
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function renderRosterBoardTabs() {
      const tabs = [
        ["board", "Roster Board"],
        ["issues", "Open Slots & Conflicts"],
        ["history", "History"]
      ];
      return `
        <div class="roster-board-tabs">
          ${tabs.map(tab => `<button class="roster-board-tab ${activeRosterBoardTab === tab[0] ? "is-active" : ""}" data-roster-board-tab="${tab[0]}" type="button">${tab[1]}</button>`).join("")}
        </div>
      `;
    }

    function renderRosterBoardGrid(record, location, activeShifts, employees, dates) {
      const boardWidth = 230 + (dates.length * 152);
      return `
        <div class="roster-board-shell">
          <table class="roster-board-table" style="min-width:${boardWidth}px">
            <thead>
              <tr>
                <th class="employee-column">Employee</th>
                ${dates.map(date => `<th><span>${date.dayName}</span><strong>${date.day}</strong><small>${date.monthLabel}</small></th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${employees.map((employee, employeeIndex) => `
                <tr>
                  <td class="employee-column">
                    <div class="roster-employee">
                      <span class="roster-avatar">${employeeInitials(employee[1])}</span>
                      <span>
                        <strong class="roster-employee-name">
                          ${employee[1]}
                          ${isRosterEmployeeKeyholder(employee[0], location.id) ? `<i class="roster-keyholder-icon" data-lucide="key-round" aria-label="Keyholder eligible"></i>` : ""}
                        </strong>
                        <div class="field-help">${employee[2]} | ${employee[3]}</div>
                      </span>
                    </div>
                  </td>
                  ${dates.map((date, dayIndex) => `<td>${renderRosterCell(employeeIndex, dayIndex, activeShifts, employee, date)}</td>`).join("")}
                </tr>
              `).join("")}
              <tr>
                <td class="employee-column"><strong>Open Slots</strong><div class="field-help">Unassigned requirements</div></td>
                ${dates.map((date, dayIndex) => {
                  const hasOpen = record.open && dayIndex % 5 === 0;
                  return `<td>${hasOpen ? `<div class="roster-cell open" data-roster-cell="true" data-employee-name="Open Slot" data-roster-date="${date.label} ${date.year}"><strong>Open Slot</strong><span>1 ${location.services[0]?.[1] || "Staff"}</span></div>` : ""}</td>`;
                }).join("")}
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    function renderRosterIssuePanel(record, location, activeShifts, dates) {
      return `
        <div class="roster-panel-empty">
          <i data-lucide="check-circle-2"></i>
          <div>No issues detected for this roster period.</div>
        </div>`;
    }

    function renderRosterHistoryPanel(record, location) {
      return `
        <div class="roster-panel-empty">
          <i data-lucide="history"></i>
          <div>No roster history available yet.</div>
        </div>`;
    }

    function setRosterBoardTab(tabKey) {
      activeRosterBoardTab = tabKey;
      $$(".roster-board-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.rosterBoardTab === tabKey));
      $$(".roster-board-panel").forEach(panel => panel.classList.toggle("is-active", panel.dataset.rosterBoardPanel === tabKey));
    }

    function renderRosterBoard(record, location) {
      activeRosterBoardTab = activeRosterBoardTab || "board";
      currentRosterBoardRecord = record;
      currentRosterBoardLocation = location;
      const activeShifts = location.shifts.filter(shift => shift[5] === "Active");
      const employees = rosterBoardEmployees(location);
      const dates = rosterBoardDates(record.period);
      const summary = [
        ["Filled Slots", record.filled, "Assigned employee slots", "calendar-check-2", "blue"],
        ["Open Slots", record.open, "Calculated from roster slots", "user-round-x", "amber"],
        ["Conflicts", record.conflicts, "Needs roster review", "triangle-alert", "red"],
        ["Keyholder Coverage", record.keyholder, "Eligibility checked", "key-round", "green"],
        ["Employees", employees.length, "Assigned to location", "users-round", "blue"]
      ];
      $("#moduleSummary").innerHTML = summary.map(item => `
        <article class="card summary-card roster-summary-card">
          <div>
            <div class="summary-label">${item[0]}</div>
            <div class="summary-value">${item[1]}</div>
            <div class="summary-note">${item[2]}</div>
          </div>
          <span class="roster-summary-icon ${item[4]}"><i data-lucide="${item[3]}"></i></span>
        </article>
      `).join("");
      $("#columnButton").style.display = "none";
      $("#moduleTableTitle").textContent = "Roster Board";
      $("#moduleTableSubtitle").textContent = `${location.listName} | ${record.period} | ${record.version}`;
      const module = $("#moduleView");
      module.classList.remove("roster-control-view");
      module.classList.add("roster-board-view");
      $(".filter-bar", module).innerHTML = "";
      $(".filter-bar", module).style.display = "none";
      $(".table-wrap", module).classList.add("roster-board-table-wrap");
      const toolbar = `
        <div class="roster-board-toolbar">
          <div class="roster-board-legend">
            ${activeShifts.map((shift, index) => `<span class="badge ${index % 2 ? "green" : "blue"}">${shift[1]}</span>`).join("")}
            <span class="badge grey">Weekly Off</span>
            <span class="badge blue">Leave</span>
            <span class="badge amber">Open Slot</span>
            <span class="badge red">Conflict</span>
          </div>
          <div class="roster-board-toolbar-actions">
            <button class="button" data-roster-board-action="validate" data-location-id="${location.id}" type="button"><i data-lucide="shield-check"></i>Validate</button>
            <button class="button" data-roster-board-action="export" data-location-id="${location.id}" type="button"><i data-lucide="download"></i>Export</button>
            <button class="button primary" data-roster-board-action="publish" data-location-id="${location.id}" type="button" ${record.open || record.conflicts ? "disabled" : ""}><i data-lucide="send"></i>Publish Draft</button>
          </div>
        </div>
      `;
      const context = `
        <div class="roster-context-bar">
          <div class="roster-context-item"><span>Location</span><strong>${location.listName}</strong></div>
          <div class="roster-context-item"><span>Roster Period</span><strong>${record.period}</strong></div>
          <div class="roster-context-item"><span>Version</span><strong>${record.version}</strong></div>
          <div class="roster-context-item"><span>Status</span><strong><span class="badge ${statusClass[record.status] || "grey"}">${record.status}</span></strong></div>
          <div class="roster-context-item"><span>Last Updated</span><strong>${record.updated}</strong></div>
        </div>
      `;
      $(".table-wrap", $("#moduleView")).innerHTML = `
        ${context}
        ${renderRosterBoardTabs()}
        <section class="roster-board-panel ${activeRosterBoardTab === "board" ? "is-active" : ""}" data-roster-board-panel="board">
          ${renderRosterBoardGrid(record, location, activeShifts, employees, dates)}
        </section>
        <section class="roster-board-panel ${activeRosterBoardTab === "issues" ? "is-active" : ""}" data-roster-board-panel="issues">
          ${renderRosterIssuePanel(record, location, activeShifts, dates)}
        </section>
        <section class="roster-board-panel ${activeRosterBoardTab === "history" ? "is-active" : ""}" data-roster-board-panel="history">
          ${renderRosterHistoryPanel(record, location)}
        </section>
        ${toolbar}
      `;
      $(".pagination", $("#moduleView")).style.display = "none";
      refreshIcons();
    }

    function renderRosterBoardFromData(data, location) {
      activeRosterBoardTab = activeRosterBoardTab || "board";
      currentRosterBoardLocation = location;
      currentPublishedRosterData = data;
      const periodStr = (data.period?.start && data.period?.end)
        ? formatShortDate(data.period.start) + " — " + formatShortDate(data.period.end)
        : "selected period";
      currentRosterBoardRecord = {
        rosterId: data.rosterId,
        period: periodStr,
        version: data.version,
        status: data.status,
        filled: data.filled,
        open: data.open,
        conflicts: data.conflicts,
        keyholder: "Configured",
        updated: data.createdAt ? formatShortDate(data.createdAt) : "",
      };
      const employees = (data.employees || []).map(emp => ({
        id: emp.employee_id,
        name: emp.employee_name || (emp.first_name ? `${emp.first_name} ${emp.last_name || ""}`.trim() : ""),
        department: emp.department || emp.department_name || "",
        designation: emp.designation_name || "",
        code: emp.employee_code || "",
      }));
      const dates = (data.dates || []).map(d => {
        const dt = new Date(d.iso + "T00:00:00");
        return {
          day: dt.getDate(),
          label: d.label,
          dayName: d.dayName,
          monthLabel: dt.toLocaleDateString("en-GB", { month: "short" }),
          year: dt.getFullYear(),
          iso: d.iso,
        };
      });
      const activeShifts = data.shifts || [];
      const allocation = data.allocation || {};
      const summary = [
        ["Filled Slots", data.filled, "Assigned employee slots", "calendar-check-2", "blue"],
        ["Open Slots", data.open, "Calculated from roster slots", "user-round-x", "amber"],
        ["Conflicts", data.conflicts, "Needs roster review", "triangle-alert", "red"],
        ["Keyholder Coverage", data.summary?.keyholderStatus || data.keyholder || "Configured", "Eligibility checked", "key-round", "green"],
        ["Employees", employees.length, "Assigned to location", "users-round", "blue"],
      ];
      $("#moduleSummary").innerHTML = summary.map(item => `
        <article class="card summary-card roster-summary-card">
          <div>
            <div class="summary-label">${item[0]}</div>
            <div class="summary-value">${item[1]}</div>
            <div class="summary-note">${item[2]}</div>
          </div>
          <span class="roster-summary-icon ${item[4]}"><i data-lucide="${item[3]}"></i></span>
        </article>
      `).join("");
      $("#columnButton").style.display = "none";
      $("#moduleTableTitle").textContent = "Roster Board";
      $("#moduleTableSubtitle").textContent = `${location.listName} | ${periodStr} | ${data.version}`;
      const module = $("#moduleView");
      module.classList.remove("roster-control-view");
      module.classList.add("roster-board-view");
      $(".filter-bar", module).innerHTML = "";
      $(".filter-bar", module).style.display = "none";
      $(".table-wrap", module).classList.add("roster-board-table-wrap");
      const toolbar = `
        <div class="roster-board-toolbar">
          <div class="roster-board-legend">
            ${activeShifts.map((shift, index) => `<span class="badge ${index % 2 ? "green" : "blue"}">${shift[1] || shift[0]}</span>`).join("")}
            <span class="badge grey">Weekly Off</span>
            <span class="badge blue">Leave</span>
            <span class="badge amber">Open Slot</span>
            <span class="badge red">Conflict</span>
          </div>
          <div class="roster-board-toolbar-actions">
            <button class="button" data-roster-board-action="refresh" data-location-id="${location.id}" type="button"><i data-lucide="refresh-cw"></i>Refresh</button>
            <button class="button primary" data-roster-board-action="save-draft" data-roster-id="${data.rosterId}" data-location-id="${location.id}" type="button"><i data-lucide="save"></i>Save as Draft</button>
          </div>
        </div>
      `;
      const context = `
        <div class="roster-context-bar">
          <div class="roster-context-item"><span>Location</span><strong>${location.listName}</strong></div>
          <div class="roster-context-item"><span>Roster Period</span><strong>${periodStr}</strong></div>
          <div class="roster-context-item"><span>Version</span><strong>${data.version}</strong></div>
          <div class="roster-context-item"><span>Status</span><strong><span class="badge ${statusClass[data.status] || "grey"}">${data.status}</span></strong></div>
          <div class="roster-context-item"><span>Last Updated</span><strong>${data.createdAt ? formatShortDate(data.createdAt) : ""}</strong></div>
        </div>
      `;
      $(".table-wrap", $("#moduleView")).innerHTML = `
        ${context}
        ${renderRosterBoardTabs()}
        <section class="roster-board-panel ${activeRosterBoardTab === "board" ? "is-active" : ""}" data-roster-board-panel="board">
          ${renderRosterBoardGridFromData(employees, dates, allocation, activeShifts)}
        </section>
        <section class="roster-board-panel ${activeRosterBoardTab === "issues" ? "is-active" : ""}" data-roster-board-panel="issues">
          ${renderRosterIssuePanelFromData(data, location)}
        </section>
        <section class="roster-board-panel ${activeRosterBoardTab === "history" ? "is-active" : ""}" data-roster-board-panel="history">
          ${renderRosterHistoryPanel(currentRosterBoardRecord, location)}
        </section>
        ${toolbar}
      `;
      $(".pagination", $("#moduleView")).style.display = "none";
      refreshIcons();
    }

    function renderRosterBoardGridFromData(employees, dates, allocation, shifts) {
      const boardWidth = 230 + (dates.length * 152);
      return `
        <div class="roster-board-shell">
          <table class="roster-board-table" style="min-width:${boardWidth}px">
            <thead>
              <tr>
                <th class="employee-column">Employee</th>
                ${dates.map(date => `<th><span>${date.dayName}</span><strong>${date.day}</strong><small>${date.monthLabel}</small></th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${employees.map(employee => `
                <tr>
                  <td class="employee-column">
                    <div class="roster-employee">
                      <span class="roster-avatar">${employeeInitials(employee.name)}</span>
                      <span>
                        <strong class="roster-employee-name">
                          ${employee.name}
                          ${isRosterEmployeeKeyholder(employee.id, currentRosterBoardLocation?.id) ? `<i class="roster-keyholder-icon" data-lucide="key-round" aria-label="Keyholder eligible"></i>` : ""}
                        </strong>
                        <div class="field-help">${employee.department}${employee.designation ? ` | ${employee.designation}` : ""}</div>
                      </span>
                    </div>
                  </td>
                  ${dates.map(date => `<td>${renderRosterStoredCell(employee.id, date.iso, allocation, shifts)}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderRosterStoredCell(employeeId, dateIso, allocation, shifts) {
      const alloc = allocation?.[employeeId]?.[dateIso];
      const cellAttrs = `data-employee-id="${employeeId}" data-roster-date="${dateIso}" data-roster-cell="true"`;
      if (!alloc) {
        return `<div class="roster-cell open" ${cellAttrs}><strong>Open</strong><span>Unassigned</span></div>`;
      }
      switch (alloc.type) {
        case "weekly_off":
          return `<div class="roster-cell off" ${cellAttrs}><strong>WO</strong><span>Weekly Off</span></div>`;
        case "leave":
          return `<div class="roster-cell leave" ${cellAttrs}><strong>LV</strong><span>On Leave</span></div>`;
        case "store_closed":
          return `<div class="roster-cell closed" ${cellAttrs}><strong>--</strong><span>Closed</span></div>`;
        case "assigned":
          if (alloc.shift) {
            const shiftIndex = shifts.findIndex(s => String(s[1] || s[0]) === String(alloc.shift));
            const cls = shiftIndex >= 0 ? `shift-${shiftIndex % 2}` : "open";
            return `<div class="roster-cell ${cls}" ${cellAttrs} data-shift-name="${alloc.shift}"><strong>${alloc.shift}</strong><span>Shift</span></div>`;
          }
          return `<div class="roster-cell open" ${cellAttrs}><strong>Open</strong><span>No shift</span></div>`;
        default:
          return `<div class="roster-cell open" ${cellAttrs}><strong>Open</strong><span>${alloc.conflicts?.[0] || "Unassigned"}</span></div>`;
      }
    }

    function renderRosterIssuePanelFromData(data, location) {
      const issues = [];
      for (const empId in (data.allocation || {})) {
        for (const dateIso in data.allocation[empId]) {
          const alloc = data.allocation[empId][dateIso];
          if (alloc.conflicts && alloc.conflicts.length > 0) {
            const emp = (data.employees || []).find(e => String(e.employee_id) === String(empId));
            issues.push({ employeeName: emp?.employee_name || "Employee", date: dateIso, conflicts: alloc.conflicts });
          }
        }
      }
      if (issues.length === 0) {
        return `
          <div class="roster-panel-empty">
            <i data-lucide="check-circle-2"></i>
            <div>No issues detected for this roster period.</div>
          </div>`;
      }
      return `
        <div class="roster-issues-list">
          ${issues.map(issue => `
            <div class="roster-issue-item">
              <strong>${issue.employeeName}</strong> on <em>${formatShortDate(issue.date)}</em>:
              ${issue.conflicts.map(c => `<span class="badge red">${c}</span>`).join(" ")}
            </div>
          `).join("")}
        </div>
      `;
    }

    function updatePublishedCellAlloc(employeeId, dateIso, type, shiftName) {
      if (!currentPublishedRosterData) return;
      if (!currentPublishedRosterData.allocation) currentPublishedRosterData.allocation = {};
      if (!currentPublishedRosterData.allocation[employeeId]) currentPublishedRosterData.allocation[employeeId] = {};
      const alloc = { type, source: "manual", conflicts: [] };
      if (type === "assigned" && shiftName) {
        alloc.shift = shiftName;
        const shiftArr = (currentPublishedRosterData.shifts || []).find(s => String(s[1] || s[0]) === String(shiftName));
        if (shiftArr) {
          alloc.policy_id = shiftArr[0];
          alloc.shiftType = shiftArr[2];
        }
      } else {
        alloc.shift = null;
      }
      currentPublishedRosterData.allocation[employeeId][dateIso] = alloc;
      publishedRosterDirty = true;
      const cell = document.querySelector(`[data-employee-id="${employeeId}"][data-roster-date="${dateIso}"]`);
      if (cell) {
        const newHtml = renderRosterStoredCell(employeeId, dateIso, currentPublishedRosterData.allocation, currentPublishedRosterData.shifts || []);
        cell.outerHTML = newHtml;
      }
    }

    function renderRosterCellPicker(employeeId, dateIso, cellEl) {
      const existing = document.querySelector(".roster-cell-editor");
      if (existing) existing.remove();
      const activeShifts = (currentRosterBoardLocation?.shifts || []).filter(s => s[5] === "Active");
      const empData = (currentPublishedRosterData?.employees || []).find(e => String(e.employee_id) === String(employeeId));
      const defaultShiftId = empData ? Number(empData.default_shift_id) : null;
      const rect = cellEl.getBoundingClientRect();
      const picker = document.createElement("div");
      picker.className = "roster-cell-editor";
      const defShift = defaultShiftId ? activeShifts.find(s => Number(s[0]) === defaultShiftId) : null;
      const otherShifts = defaultShiftId ? activeShifts.filter(s => Number(s[0]) !== defaultShiftId) : activeShifts;
      const list = document.createElement("div");
      list.style.cssText = "display:flex;flex-direction:column;gap:1px;";
      if (defShift) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = (defShift[1] || defShift[0]) + " ★";
        btn.style.cssText = "display:block;width:100%;text-align:left;padding:3px 6px;border:none;border-radius:3px;background:#eaf4fb;cursor:pointer;font-size:11px;white-space:nowrap;font-weight:600;";
        btn.addEventListener("mouseenter", () => btn.style.background = "#dbeafe");
        btn.addEventListener("mouseleave", () => btn.style.background = "#eaf4fb");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          picker.remove();
          updatePublishedCellAlloc(employeeId, dateIso, "assigned", defShift[1] || defShift[0]);
        });
        list.appendChild(btn);
      }
      otherShifts.forEach(s => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = s[1] || s[0];
        btn.style.cssText = "display:block;width:100%;text-align:left;padding:3px 6px;border:none;border-radius:3px;background:transparent;cursor:pointer;font-size:11px;white-space:nowrap;";
        btn.addEventListener("mouseenter", () => btn.style.background = "#f3f4f6");
        btn.addEventListener("mouseleave", () => btn.style.background = "transparent");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          picker.remove();
          updatePublishedCellAlloc(employeeId, dateIso, "assigned", s[1] || s[0]);
        });
        list.appendChild(btn);
      });
      const sep = document.createElement("div");
      sep.style.cssText = "height:1px;background:#e5e7eb;margin:2px 0;";
      list.appendChild(sep);
      [
        { label: "Weekly Off", value: "wo" },
        { label: "Leave", value: "leave" },
        { label: "Open Slot", value: "open" },
      ].forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = opt.label;
        btn.style.cssText = "display:block;width:100%;text-align:left;padding:3px 6px;border:none;border-radius:3px;background:transparent;cursor:pointer;font-size:11px;white-space:nowrap;";
        btn.addEventListener("mouseenter", () => btn.style.background = "#f3f4f6");
        btn.addEventListener("mouseleave", () => btn.style.background = "transparent");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          picker.remove();
          if (opt.value === "wo") updatePublishedCellAlloc(employeeId, dateIso, "weekly_off", null);
          else if (opt.value === "leave") updatePublishedCellAlloc(employeeId, dateIso, "leave", null);
          else updatePublishedCellAlloc(employeeId, dateIso, "unassigned", null);
        });
        list.appendChild(btn);
      });
      picker.style.cssText = `position:fixed;z-index:9999;background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:3px;box-shadow:0 4px 12px rgba(0,0,0,0.12);font-size:11px;width:max-content;max-width:${window.innerWidth - 8}px;`;
      picker.appendChild(list);
      let finalLeft = Math.max(4, Math.min(rect.left, window.innerWidth - 140));
      picker.style.left = `${finalLeft}px`;
      picker.style.top = `${rect.bottom + 2}px`;
      document.body.appendChild(picker);
      setTimeout(() => {
        const closer = (ev) => {
          if (!picker.contains(ev.target)) {
            picker.remove();
            document.removeEventListener("click", closer);
          }
        };
        document.addEventListener("click", closer);
      }, 0);
    }

    function renderModule(pageKey) {
      const config = pageConfig[pageKey];
      if (!config) return;
      if (pageKey === "roster") {
        renderRosterControlCenter();
        return;
      }
      restoreGenericModuleFilters();
      const search = $("#moduleSearch").value.trim().toLowerCase();
      const location = $("#moduleLocation").value;
      const status = $("#moduleStatus").value;
      const rows = config.rows.filter(row => {
        const rowText = row.join(" ").toLowerCase();
        const rowLocation = subLocations.find(loc => row.includes(loc.listName))?.listName;
        const rowStatus = row[row.length - 1];
        return (!search || rowText.includes(search))
          && (location === "all" || rowLocation === location)
          && (status === "all" || rowStatus === status);
      });

      $("#moduleSummary").innerHTML = config.labels.map((label, index) => `
        <article class="card summary-card">
          <div class="summary-label">${label}</div>
          <div class="summary-value">${config.values[index]}</div>
          <div class="summary-note">${index === 0 ? "Current operational total" : index === 1 ? "Within configured scope" : "Requires routine monitoring"}</div>
        </article>
      `).join("");

      $("#moduleTableTitle").textContent = `${config.title} Records`;
      $("#moduleTableSubtitle").textContent = `Current ${config.parent.toLowerCase()} data and workflow status`;
      $("#moduleTableHead").innerHTML = `<tr><th class="checkbox-cell"><input type="checkbox" aria-label="Select all"></th>${config.columns.map(column => `<th>${column}</th>`).join("")}<th class="action-cell">Action</th></tr>`;
      $("#moduleTableBody").innerHTML = rows.map((row, rowIndex) => {
        const sourceIndex = config.rows.indexOf(row);
        return `<tr data-row-index="${sourceIndex}" data-page="${pageKey}" class="${pageKey === "entity-master" && row[0] === selectedEntityId ? "is-selected" : ""}">
          <td class="checkbox-cell"><input type="checkbox" aria-label="Select record ${rowIndex + 1}"></td>
          ${row.map((cell, index) => {
            const isStatus = index === row.length - 1;
            return `<td>${isStatus ? `<span class="badge ${statusClass[cell] || "grey"}">${cell}</span>` : cell}</td>`;
          }).join("")}
          <td class="action-cell">
            <div class="row-menu-wrap">
              <button class="row-menu-button" aria-label="Record actions"><i data-lucide="ellipsis"></i></button>
              <div class="row-menu">
                <button data-row-action="edit"><i data-lucide="pencil"></i>Edit record</button>
                <button data-row-action="view"><i data-lucide="eye"></i>View details</button>
              </div>
            </div>
          </td>
        </tr>`;
      }).join("");
      $("#moduleEmpty").classList.toggle("is-visible", rows.length === 0);
      $("#moduleTableBody").closest("table").style.display = rows.length ? "table" : "none";
      const mc2 = $("#moduleCount");
      if (mc2) mc2.textContent = rows.length;
      refreshIcons();
    }

    function getSelectedLocation() {
      return subLocations.find(location => location.id === selectedLocationId) || subLocations[0] || null;
    }

    function isFallbackShift(shift) {
      return shift?.[6] === "Fallback" || /official hours coverage/i.test(shift?.[1] || "");
    }

    function fallbackShiftForLocation(location) {
      if (!location || location.type === "Head Office") return null;
      const existing = (location.shifts || []).find(shift => isFallbackShift(shift));
      if (existing) return existing;
      return [
        `${location.id}-OHC`,
        "Official Hours Coverage",
        location.officialHours,
        "1",
        "Rotational",
        "Active",
        "Fallback"
      ];
    }

    function shiftCoverageRole(shift) {
      return isFallbackShift(shift) ? "Fallback" : "Standard";
    }

    function shiftRowsForLocation(location) {
      const fallback = fallbackShiftForLocation(location);
      const rows = [...(location.shifts || [])];
      return fallback && !rows.some(shift => shift[0] === fallback[0]) ? [...rows, fallback] : rows;
    }

    function titleCaseValue(value) {
      return String(value || "")
        .replaceAll("_", " ")
        .replace(/\b\w/g, character => character.toUpperCase());
    }

    function locationTypeLabel(value) {
      return {
        store: "Retail Store",
        warehouse: "Warehouse",
        office: "Head Office",
        hub: "Hub"
      }[value] || titleCaseValue(value);
    }

    function renderLocationKpis() {
      const active = subLocations.filter(location => location.status === "Active").length;
      const ready = subLocations.filter(location => location.readinessLabel === "Ready").length;
      const blocked = subLocations.filter(location => location.readinessLabel === "Blocked").length;
      const incomplete = subLocations.length - ready - blocked;
      $("#totalLocationCount").textContent = subLocations.length;
      $("#activeLocationCount").textContent = active;
      $("#readyLocationCount").textContent = ready;
      $("#incompleteLocationCount").textContent = incomplete;
      $("#blockedLocationCount").textContent = blocked;
      $("#locationListCount").textContent = `(${subLocations.length})`;
    }

    function renderLocationList() {
      const query = $("#locationSearch").value.trim().toLowerCase();
      const locations = subLocations.filter(location =>
        `${location.name} ${location.listName} ${location.id} ${location.parent}`.toLowerCase().includes(query)
      );

      $("#locationList").innerHTML = locations.map(location => `
        <button class="location-list-item ${location.id === selectedLocationId ? "is-selected" : ""}" data-location-id="${location.id}">
          <span class="location-pin"><i data-lucide="map-pin"></i></span>
          <span class="location-item-copy">
            <span class="location-item-name">${location.listName}</span>
            <span class="location-item-code">${location.id}</span>
          </span>
          <span class="location-item-state">
            <span class="badge ${statusClass[location.status] || "grey"}">${location.status}</span>
            <span class="readiness-text ${location.readinessTone}">${location.readinessLabel}</span>
          </span>
        </button>
      `).join("");

      if (!locations.length) {
        $("#locationList").innerHTML = `<div class="location-empty">No locations match the current search.</div>`;
      }
      $("#locationListFoot").textContent = locations.length
        ? `Showing 1 to ${locations.length} of ${subLocations.length} locations`
        : `Showing 0 of ${subLocations.length} locations`;
      refreshIcons();
    }

    function renderLocationMeta(location) {
      $("#selectedLocationName").textContent = location.name;
      $("#selectedLocationStatus").textContent = location.status;
      $("#selectedLocationStatus").className = `badge ${statusClass[location.status] || "grey"}`;
      $("#selectedLocationMeta").innerHTML = `
        <div class="location-meta-item">
          <div class="location-meta-label">Location Code</div>
          <div class="location-meta-value">${location.id}</div>
        </div>
        <div class="location-meta-item">
          <div class="location-meta-label">Parent Entity</div>
          <div class="location-meta-value">${location.parent} (${location.parentCode})</div>
        </div>
        <div class="location-meta-item">
          <div class="location-meta-label">State</div>
          <div class="location-meta-value">${location.state}</div>
        </div>
        <div class="location-meta-item">
          <div class="location-meta-label">Operating Type</div>
          <div class="location-meta-value">${location.type}</div>
        </div>
        <div class="location-meta-item">
          <div class="location-meta-label">Readiness Score</div>
          <div class="location-meta-value readiness-score">
            <span>${location.readiness}%</span>
            <span class="score-ring" style="--score:${location.readiness}%"></span>
          </div>
        </div>
      `;
    }

    function tabHeader(title, description, actions = "") {
      return `
        <div class="tab-section-head">
          <div>
            <h3 class="tab-section-title">${title}</h3>
            <p class="tab-section-copy">${description}</p>
          </div>
          ${actions ? `<div class="tab-section-actions">${actions}</div>` : ""}
        </div>
      `;
    }

    function renderOverviewTab(location) {
      const configuredServices = location.services.filter(service => service[3] === "Active").length;
      const activePolicies = location.shifts.filter(shift => shift[5] === "Active").length;
      const weeklyHours = location.closedDay ? "54 hrs" : "77 hrs";
      const areas = [
        ["Operating Hours", "Configured"],
        ["Service Config", location.services.length ? (configuredServices === location.services.length ? "Configured" : "In Progress") : "Not Applicable"],
        ["Delivery Zone", location.deliveryZones.length ? "Configured" : "Not Applicable"],
        ["Onboarding Checklist", location.readiness >= 80 ? "Completed" : "In Progress"],
        ["Shift Policy", activePolicies ? "Configured" : "In Progress"]
      ];
      return `
        ${tabHeader("Location Overview", "Current setup status for the selected location.",
          `<button class="button" data-control-action="readiness"><i data-lucide="clipboard-check"></i>Run Readiness Check</button>`)}
        <div class="overview-grid">
          <div class="overview-metric">
            <div class="overview-metric-head"><span>Configured Services</span><i data-lucide="briefcase-business"></i></div>
            <div class="overview-metric-value">${configuredServices}</div>
            <div class="overview-metric-note">${location.type === "Head Office" ? "Not applicable to this office" : `${location.services.length} service records`}</div>
          </div>
          <div class="overview-metric">
            <div class="overview-metric-head"><span>Shift Policies</span><i data-lucide="clock-3"></i></div>
            <div class="overview-metric-value">${location.shifts.length}</div>
            <div class="overview-metric-note">${activePolicies} active for roster use</div>
          </div>
          <div class="overview-metric">
            <div class="overview-metric-head"><span>Weekly Operating Time</span><i data-lucide="calendar-days"></i></div>
            <div class="overview-metric-value">${weeklyHours}</div>
            <div class="overview-metric-note">${location.closedDay ? `Closed on ${location.closedDay}` : "Open all seven days"}</div>
          </div>
        </div>
        <div class="control-table-wrap">
          <table class="control-table">
            <thead><tr><th>Setup Area</th><th>Scope</th><th>Status</th><th class="action-cell">Action</th></tr></thead>
            <tbody>
              ${areas.map(area => `
                <tr>
                  <td>${area[0]}</td>
                  <td>${location.listName}</td>
                  <td><span class="badge ${statusClass[area[1]] || "grey"}">${area[1]}</span></td>
                  <td class="action-cell"><button class="row-menu-button" data-control-action="open-area" aria-label="Open ${area[0]}"><i data-lucide="chevron-right"></i></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    function formatTime24Hour(value) {
      if (!value) return "—";
      const [hourValue, minute = "00"] = value.split(":");
      const hour = Number(hourValue);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
    }

    function formatHourRange(open, close) {
      if (!open || !close) return "Not configured";
      return `${formatTime24Hour(open)} - ${formatTime24Hour(close)}`;
    }

    function timeValueParts(value) {
      const [hourValue = "00", minuteValue = "00"] = String(value || "00:00").split(":");
      const hour24 = Number(hourValue);
      return {
        hour: String(hour24 % 12 || 12).padStart(2, "0"),
        minute: String(Math.max(0, Math.min(59, Number(minuteValue) || 0))).padStart(2, "0"),
        period: hour24 >= 12 ? "PM" : "AM"
      };
    }

    function composeTimeValue(hour, minute, period) {
      const safeHour = Math.max(1, Math.min(12, Number(hour) || 12));
      const safeMinute = Math.max(0, Math.min(59, Number(minute) || 0));
      const hour24 = period === "PM"
        ? (safeHour === 12 ? 12 : safeHour + 12)
        : (safeHour === 12 ? 0 : safeHour);
      return `${String(hour24).padStart(2, "0")}:${String(safeMinute).padStart(2, "0")}`;
    }

    function renderNumberOptions(start, end, selectedValue) {
      return Array.from({ length: end - start + 1 }, (_, index) => {
        const value = String(start + index).padStart(2, "0");
        return `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${value}</option>`;
      }).join("");
    }

    function renderSplitTimeControl({ value, field, dayOfWeek = "", disabled = false, label = "", mode = "hours" }) {
      const parts = timeValueParts(value);
      const disabledAttribute = disabled ? "disabled" : "";
      const baseAttributes = mode === "hours"
        ? `data-hours-field="${field}" data-day-of-week="${dayOfWeek}"`
        : `data-shift-time-field="${field}"`;
      const partAttribute = mode === "hours" ? "data-hours-time-part" : "data-shift-time-part";
      return `
        <div class="split-time-control ${mode === "shift" ? "shift-time-control" : ""}" aria-label="${label}">
          <select ${baseAttributes} ${partAttribute}="hour" ${disabledAttribute} aria-label="${label} hour">
            ${renderNumberOptions(1, 12, parts.hour)}
          </select>
          <select ${baseAttributes} ${partAttribute}="minute" ${disabledAttribute} aria-label="${label} minute">
            ${renderNumberOptions(0, 59, parts.minute)}
          </select>
          <select ${baseAttributes} ${partAttribute}="period" ${disabledAttribute} aria-label="${label} AM PM">
            <option value="AM" ${parts.period === "AM" ? "selected" : ""}>AM</option>
            <option value="PM" ${parts.period === "PM" ? "selected" : ""}>PM</option>
          </select>
        </div>
      `;
    }

    function readSplitTimeValue(container, fieldAttribute, partAttribute, fieldName, dayOfWeek = null) {
      const controls = $$(`[${fieldAttribute}="${fieldName}"]`, container)
        .filter(control => dayOfWeek === null || Number(control.dataset.dayOfWeek) === Number(dayOfWeek));
      const hour = controls.find(control => control.getAttribute(partAttribute) === "hour")?.value;
      const minute = controls.find(control => control.getAttribute(partAttribute) === "minute")?.value;
      const period = controls.find(control => control.getAttribute(partAttribute) === "period")?.value;
      return composeTimeValue(hour, minute, period);
    }

    function timeToMinutes(value) {
      if (!value || !value.includes(":")) return null;
      const [hour, minute] = value.split(":").map(Number);
      return hour * 60 + minute;
    }

    function minutesToTimeValue(minutes) {
      const normalized = Math.max(0, Math.min(23 * 60 + 30, minutes));
      const hour = String(Math.floor(normalized / 60)).padStart(2, "0");
      const minute = String(normalized % 60).padStart(2, "0");
      return `${hour}:${minute}`;
    }

    function weekDayLabel(value) {
      const labels = {
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday",
        "7": "Sunday"
      };
      return labels[value] || "";
    }

    function getOperationalWindow(location) {
      const openRows = operatingHoursForLocation(location).filter(row => row.isOpen && row.operationalOpen && row.operationalClose);
      if (!openRows.length) return null;
      const first = openRows[0];
      return {
        open: first.operationalOpen,
        close: first.operationalClose,
        openMinutes: timeToMinutes(first.operationalOpen),
        closeMinutes: timeToMinutes(first.operationalClose)
      };
    }

    function getOfficialWindow(location) {
      const openRows = operatingHoursForLocation(location).filter(row => row.isOpen && row.officialOpen && row.officialClose);
      if (!openRows.length) return null;
      const first = openRows[0];
      return {
        open: first.officialOpen,
        close: first.officialClose,
        openMinutes: timeToMinutes(first.officialOpen),
        closeMinutes: timeToMinutes(first.officialClose)
      };
    }

    function getKeyholderOptions(locationId, excludedEmployeeId = "") {
      return keyholderEmployees.filter(employee =>
        employee.locationId === locationId &&
        employee.status === "Active" &&
        employee.keyholderEligible &&
        employee.id !== excludedEmployeeId
      );
    }

    function renderKeyholderOptions(select, employees, placeholder, selectedValue = "") {
      select.innerHTML = [
        `<option value="">${placeholder}</option>`,
        ...employees.map(employee => `<option value="${employee.id}" ${employee.id === selectedValue ? "selected" : ""}>${employee.id} - ${employee.name}</option>`)
      ].join("");
    }

    function generateShiftPolicyId() {
      const maxId = subLocations
        .flatMap(location => location.shifts.map(shift => shift[0]))
        .map(id => Number(String(id).replace(/\D/g, "")))
        .filter(Number.isFinite)
        .reduce((max, value) => Math.max(max, value), 1400);
      return `SFP${maxId + 1}`;
    }

    function syncShiftTimeField(fieldName) {
      const targetId = fieldName === "shift_start_time" ? "shiftStartTime" : "shiftEndTime";
      const containerId = fieldName === "shift_start_time" ? "shiftStartTimeParts" : "shiftEndTimeParts";
      const container = $(`#${containerId}`);
      if (!container) return;
      $(`#${targetId}`).value = readSplitTimeValue(container, "data-shift-time-field", "data-shift-time-part", fieldName);
    }

    function syncShiftTimeFields() {
      syncShiftTimeField("shift_start_time");
      syncShiftTimeField("shift_end_time");
    }

    function setShiftTimeControls(startValue, endValue) {
      $("#shiftStartTime").value = startValue;
      $("#shiftEndTime").value = endValue;
      $("#shiftStartTimeParts").innerHTML = renderSplitTimeControl({
        value: startValue,
        field: "shift_start_time",
        label: "Shift Start Time",
        mode: "shift"
      });
      $("#shiftEndTimeParts").innerHTML = renderSplitTimeControl({
        value: endValue,
        field: "shift_end_time",
        label: "Shift End Time",
        mode: "shift"
      });
      updateShiftPolicyCalculations();
    }

    function updateShiftPolicyCalculations() {
      syncShiftTimeFields();
      const start = timeToMinutes($("#shiftStartTime").value);
      const end = timeToMinutes($("#shiftEndTime").value);
      const breakMinutes = Number($("#shiftBreakMinutes").value || 0);
      const totalHours = start !== null && end !== null && end > start ? (end - start) / 60 : 0;
      const netHours = Math.max(0, totalHours - breakMinutes / 60);
      $("#shiftTotalHours").value = totalHours.toFixed(2);
      $("#shiftNetHours").value = netHours.toFixed(2);
    }

    function updateShiftWeeklyOffControls() {
      const pattern = $("#shiftWeeklyOffPattern").value;
      const daySelect = $("#shiftWeeklyOffDay");
      const isFixed = pattern === "Fixed";
      daySelect.disabled = !isFixed;
      if (!isFixed) {
        daySelect.value = "";
        daySelect.removeAttribute("aria-invalid");
      }
    }

    function updateShiftKeyholderControls() {
      const location = getSelectedLocation();
      const primarySelect = $("#shiftPrimaryKeyholder");
      const backupSelect = $("#shiftBackupKeyholder");
      const primaryValue = primarySelect.value;
      const backupValue = backupSelect.value;
      $("#keyholderRequiredYes").classList.toggle("is-active", shiftPolicyKeyholderRequired);
      $("#keyholderRequiredNo").classList.toggle("is-active", !shiftPolicyKeyholderRequired);
      primarySelect.disabled = !shiftPolicyKeyholderRequired;
      backupSelect.disabled = !shiftPolicyKeyholderRequired;
      renderKeyholderOptions(primarySelect, getKeyholderOptions(location.id), "Select primary keyholder", primaryValue);
      renderKeyholderOptions(backupSelect, getKeyholderOptions(location.id, primarySelect.value), "Select backup keyholder", backupValue);
      if (!shiftPolicyKeyholderRequired) {
        primarySelect.value = "";
        backupSelect.value = "";
        primarySelect.removeAttribute("aria-invalid");
        backupSelect.removeAttribute("aria-invalid");
      }
      if (backupSelect.value && backupSelect.value === primarySelect.value) {
        backupSelect.value = "";
      }
    }

    function updateShiftCoverageRoleControls() {
      const role = $("#shiftCoverageRole").value;
      if (role !== "Fallback") return;
      const officialWindow = getOfficialWindow(getSelectedLocation());
      if (!$("#shiftPolicyName").value.trim()) {
        $("#shiftPolicyName").value = "Official Hours Coverage";
      }
      if (officialWindow) {
        setShiftTimeControls(officialWindow.open, officialWindow.close);
      }
      $("#shiftRequiredStaff").value = "1";
      $("#shiftDailyLeaveLimit").value = "0";
      $("#shiftWeeklyOffPattern").value = "Rotational";
      $("#shiftWeeklyOffDay").value = "";
      updateShiftWeeklyOffControls();
      updateShiftPolicyCalculations();
    }

    function clearShiftPolicyError() {
      $("#shiftPolicyError").classList.remove("is-visible");
      $$("[data-shift-field]").forEach(field => field.removeAttribute("aria-invalid"));
    }

    function showShiftPolicyError(message, fields = []) {
      $("#shiftPolicyErrorText").textContent = message;
      $("#shiftPolicyError").classList.add("is-visible");
      fields.forEach(field => field.setAttribute("aria-invalid", "true"));
      $("#shiftPolicyError").scrollIntoView({ behavior: "smooth", block: "center" });
      refreshIcons();
    }

    function resetShiftPolicyForm() {
      const location = getSelectedLocation();
      const window = getOperationalWindow(location);
      const isOffice = location.type === "Head Office";
      const startValue = window?.open || (isOffice ? "10:00" : "10:30");
      const endValue = minutesToTimeValue((timeToMinutes(startValue) || 0) + 9 * 60);
      $("#shiftPolicyId").value = "Auto-generated";
      $("#shiftPolicyName").value = "";
      $("#shiftPolicyStatus").value = "Active";
      $("#shiftCoverageRole").value = "Standard";
      setShiftTimeControls(startValue, endValue);
      $("#shiftBreakMinutes").value = "60";
      $("#shiftRequiredStaff").value = isOffice ? "5" : "4";
      $("#shiftDailyLeaveLimit").value = isOffice ? "2" : "1";
      $("#shiftWeeklyOffPattern").value = isOffice ? "Fixed" : "Rotational";
      $("#shiftWeeklyOffDay").value = isOffice ? "7" : "";
      $("#shiftMaxConsecutiveDays").value = "6";
      shiftPolicyKeyholderRequired = !isOffice;
      updateShiftPolicyCalculations();
      updateShiftWeeklyOffControls();
      updateShiftKeyholderControls();
      clearShiftPolicyError();
    }

    function openShiftPolicyModal() {
      const location = getSelectedLocation();
      resetShiftPolicyForm();
      $("#shiftPolicyLocationContext").textContent = `Location: ${location.name} (${location.id})`;
      $("#shiftPolicyModal").classList.add("is-open");
      $("#shiftPolicyName").focus();
      refreshIcons();
    }

    function closeShiftPolicyModal() {
      $("#shiftPolicyModal").classList.remove("is-open");
    }

    function collectShiftPolicyFormRecord() {
      return {
        policy_id: generateShiftPolicyId(),
        location_id: selectedLocationId,
        policy_name: $("#shiftPolicyName").value.trim(),
        coverage_role: $("#shiftCoverageRole").value,
        shift_start_time: $("#shiftStartTime").value,
        shift_end_time: $("#shiftEndTime").value,
        break_duration_minutes: Number($("#shiftBreakMinutes").value || 0),
        total_shift_hours: Number($("#shiftTotalHours").value || 0),
        net_work_hours: Number($("#shiftNetHours").value || 0),
        sanctioned_strength: Number($("#shiftRequiredStaff").value || 0),
        max_leave_per_day: Number($("#shiftDailyLeaveLimit").value || 0),
        keyholder_required: shiftPolicyKeyholderRequired,
        primary_keyholder_id: $("#shiftPrimaryKeyholder").value,
        backup_keyholder_id: $("#shiftBackupKeyholder").value,
        weekly_off_pattern: $("#shiftWeeklyOffPattern").value,
        weekly_off_day: $("#shiftWeeklyOffDay").value,
        max_consecutive_days: Number($("#shiftMaxConsecutiveDays").value || 0),
        policy_status: $("#shiftPolicyStatus").value
      };
    }

    function validateShiftPolicyRecord(record) {
      const fields = [];
      const addField = id => fields.push($(`#${id}`));
      const start = timeToMinutes(record.shift_start_time);
      const end = timeToMinutes(record.shift_end_time);
      const operationalWindow = getOperationalWindow(getSelectedLocation());

      if (!record.policy_name) addField("shiftPolicyName");
      if (!record.coverage_role) addField("shiftCoverageRole");
      if (!record.policy_status) addField("shiftPolicyStatus");
      if (!record.shift_start_time) addField("shiftStartTime");
      if (!record.shift_end_time) addField("shiftEndTime");
      if (!Number.isFinite(record.break_duration_minutes) || record.break_duration_minutes < 0) addField("shiftBreakMinutes");
      if (!Number.isInteger(record.sanctioned_strength) || record.sanctioned_strength <= 0) addField("shiftRequiredStaff");
      if (!Number.isInteger(record.max_leave_per_day) || record.max_leave_per_day < 0) addField("shiftDailyLeaveLimit");
      if (!Number.isInteger(record.max_consecutive_days) || record.max_consecutive_days <= 0) addField("shiftMaxConsecutiveDays");
      if (record.keyholder_required && !record.primary_keyholder_id) addField("shiftPrimaryKeyholder");
      if (record.weekly_off_pattern === "Fixed" && !record.weekly_off_day) addField("shiftWeeklyOffDay");
      if (record.weekly_off_pattern === "Rotational" && record.weekly_off_day) addField("shiftWeeklyOffDay");
      if (record.keyholder_required && record.backup_keyholder_id && record.backup_keyholder_id === record.primary_keyholder_id) addField("shiftBackupKeyholder");

      if (record.coverage_role === "Fallback" && getSelectedLocation().shifts.some(shift => isFallbackShift(shift))) {
        return { valid: false, message: "This location already has a fallback official-hours shift policy.", fields: [$("#shiftCoverageRole")] };
      }

      if (record.coverage_role === "Fallback" && !getOfficialWindow(getSelectedLocation())) {
        return { valid: false, message: "Configure location official hours before creating a fallback shift policy.", fields: [$("#shiftCoverageRole"), $("#shiftStartTime"), $("#shiftEndTime")] };
      }

      if (fields.length) {
        return { valid: false, message: "Complete the required shift policy fields before creating the policy.", fields };
      }

      if (start === null || end === null || end <= start) {
        return { valid: false, message: "Shift End Time must be after Shift Start Time.", fields: [$("#shiftStartTime"), $("#shiftEndTime")] };
      }

      if (!operationalWindow) {
        return { valid: false, message: "Configure location operational hours before creating a shift policy.", fields: [$("#shiftStartTime"), $("#shiftEndTime")] };
      }

      if (start < operationalWindow.openMinutes || end > operationalWindow.closeMinutes) {
        return {
          valid: false,
          message: `Shift timing must fit inside operational hours ${formatHourRange(operationalWindow.open, operationalWindow.close)}.`,
          fields: [$("#shiftStartTime"), $("#shiftEndTime")]
        };
      }

      if (record.break_duration_minutes / 60 > record.total_shift_hours) {
        return { valid: false, message: "Break duration cannot exceed total shift duration.", fields: [$("#shiftBreakMinutes")] };
      }

      if (record.net_work_hours < 0) {
        return { valid: false, message: "Net Work Hours cannot be negative.", fields: [$("#shiftBreakMinutes")] };
      }

      return { valid: true };
    }

    function createShiftPolicy(record) {
      const location = getSelectedLocation();
      const weeklyOff = record.weekly_off_pattern === "Fixed" ? weekDayLabel(record.weekly_off_day) : "Rotational";
      location.shifts.push([
        record.policy_id,
        record.policy_name,
        formatHourRange(record.shift_start_time, record.shift_end_time),
        String(record.sanctioned_strength),
        weeklyOff,
        record.policy_status,
        record.coverage_role || "Standard"
      ]);
      location.shiftPolicyRecords = [...(location.shiftPolicyRecords || []), { ...record }];
      renderLocationTab();
      closeShiftPolicyModal();
      showToast(`${record.policy_name} created for ${location.listName}.`);
    }

    function isoDateValue(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function formatShortDate(value) {
      const date = new Date(`${value}T00:00:00`);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    function defaultRosterWeek() {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: isoDateValue(start), end: isoDateValue(end) };
    }

    function populateRosterLocations(selectedId = selectedLocationId, locked = false) {
      const select = $("#rosterLocation");
      if (!select) return;
      select.innerHTML = subLocations.map(location => `
        <option value="${location.id}" ${location.id === selectedId ? "selected" : ""}>${location.name} (${location.id})</option>
      `).join("");
      select.value = selectedId;
      select.disabled = locked;
      const locHelp = $("#rosterLocationHelp");
      if (locHelp) locHelp.textContent = locked
        ? "Location is inherited from the selected Sub Location workspace."
        : "Roster is always generated location-wise.";
    }

    function setRosterGenerateStep(step) {
      const isReview = step === 2;
      const stepSetup = $("#rosterGenerateStepSetup");
      const stepReview = $("#rosterGenerateStepReview");
      if (stepSetup) stepSetup.classList.toggle("is-active", !isReview);
      if (stepReview) stepReview.classList.toggle("is-active", isReview);
      const stepOneActions = $("#rosterStepOneActions");
      const stepTwoActions = $("#rosterStepTwoActions");
      if (stepOneActions) stepOneActions.hidden = isReview;
      if (stepTwoActions) stepTwoActions.hidden = !isReview;
      const progress = $("#rosterGenerateProgress");
      if (progress) progress.textContent = isReview
        ? "Step 2 of 2: Review Generated Roster"
        : "Step 1 of 2: Setup Generation";
      const publishBtn = $("#publishRoster");
      if (publishBtn) publishBtn.hidden = !isReview || rosterGeneratedSetup?.output !== "publish";
      const confirmBtn = $("#confirmRosterDraft");
      if (confirmBtn) confirmBtn.innerHTML = `<i data-lucide="save"></i>${rosterGeneratedSetup?.output === "publish" ? "Save as Draft" : "Confirm Draft"}`;
      refreshIcons();
    }

    function openRosterGenerateModal({ lockedLocation = false } = {}) {
      const selectedId = selectedLocationId || subLocations[0]?.id;
      if (!selectedId) { showToast("No location available to generate roster."); return; }
      const week = defaultRosterWeek();
      rosterGeneratedSetup = null;
      rosterGeneratedResult = null;
      populateRosterLocations(selectedId, lockedLocation);
      const startDateEl = $("#rosterStartDate");
      const endDateEl = $("#rosterEndDate");
      if (startDateEl) startDateEl.value = week.start;
      if (endDateEl) endDateEl.value = week.end;
      const weekHelp = $("#rosterWeekHelp");
      if (weekHelp) weekHelp.textContent = `${formatShortDate(week.start)} to ${formatShortDate(week.end)}.`;
      $('[name="rosterGenerationType"][value="new_draft"]').checked = true;
      $('[name="rosterPreferenceHandling"][value="respect"]').checked = true;
      $('[name="rosterLeaveHandling"][value="approved"]').checked = true;
      $('[name="rosterOutput"][value="draft"]').checked = true;
      setRosterGenerateStep(1);
      $("#rosterGenerateModal").classList.add("is-open");
      $("#rosterStartDate").focus();
      refreshIcons();
    }

    function closeRosterGenerateModal() {
      $("#rosterGenerateModal").classList.remove("is-open");
    }

    function collectRosterGenerateSetup() {
      return {
        locationId: $("#rosterLocation").value,
        startDate: $("#rosterStartDate").value,
        endDate: $("#rosterEndDate").value,
        generationType: $('[name="rosterGenerationType"]:checked').value,
        preferenceHandling: $('[name="rosterPreferenceHandling"]:checked').value,
        leaveHandling: $('[name="rosterLeaveHandling"]:checked').value,
        output: $('[name="rosterOutput"]:checked').value
      };
    }

    function validateRosterGenerateSetup(setup) {
      if (!setup.locationId || !setup.startDate || !setup.endDate) {
        return "Select location and roster date range before generation.";
      }
      if (new Date(setup.endDate) < new Date(setup.startDate)) {
        return "End date must be after Start Date.";
      }
      return "";
    }

    async function generateRosterPreview(setup) {
      const api = window.IndipetHRMS?.api;
      const mode = window.IndipetHRMS?.dataMode;
      const location = subLocations.find(item => item.id === setup.locationId) || getSelectedLocation();
      if (!location) throw new Error("Location not found for roster generation");

      if (mode === "api" && api) {
        try {
          const data = await api.rosters.preview({
            location_id: location.dbId || location.id,
            start_date: setup.startDate,
            end_date: setup.endDate,
            preference_handling: setup.preferenceHandling,
            leave_handling: setup.leaveHandling,
          });
          return data;
        } catch (err) {
          console.error("Roster preview API error:", err);
          showToast("Failed to load roster preview from server. Using local estimate.");
        }
      }

      const standardShifts = location.shifts.filter(shift => shift[5] === "Active" && !isFallbackShift(shift));
      const fallbackShift = fallbackShiftForLocation(location);
      const fallbackAvailable = Boolean(fallbackShift && fallbackShift[5] === "Active");
      const rosterDays = Math.max(1, Math.round((new Date(setup.endDate) - new Date(setup.startDate)) / 86400000) + 1);
      const openShiftDays = location.closedDay ? rosterDays - 1 : rosterDays;
      const keyholderCount = getKeyholderOptions(location.id).length;
      const employeePool = rosterBoardEmployees(location).length || keyholderEmployees.filter(employee => employee.locationId === location.id && employee.status === "Active").length;
      const availableEmployees = employeePool;
      const fallbackUsed = fallbackAvailable && location.type !== "Head Office" && (!standardShifts.length || availableEmployees <= standardShifts.length);
      const generationShifts = fallbackUsed ? [fallbackShift] : standardShifts;
      const requiredSlots = generationShifts.reduce((total, shift) => total + Number(shift[3] || 0), 0) * openShiftDays;
      const openSlots = generationShifts.length
        ? fallbackUsed
          ? (availableEmployees && keyholderCount ? 0 : openShiftDays)
          : Math.max(0, Math.ceil(requiredSlots * 0.08) - (location.readiness > 85 ? 1 : 0))
        : Math.max(1, openShiftDays);
      const filledSlots = Math.max(0, requiredSlots - openSlots);
      const leaveConflicts = setup.leaveHandling === "approved_pending" ? 2 : 1;
      const preferenceMisses = setup.preferenceHandling === "respect" ? Math.max(fallbackUsed ? 1 : 0, openSlots) : 0;
      const conflicts = openSlots + leaveConflicts + (generationShifts.length ? 0 : 2) + (keyholderCount ? 0 : 1);
      const dates = [];
      const cursor = new Date(setup.startDate + "T00:00:00");
      const end = new Date(setup.endDate + "T00:00:00");
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

      return {
        location: { id: location.id, dbId: location.dbId, name: location.name, listName: location.listName },
        period: { start: setup.startDate, end: setup.endDate },
        dates,
        employees: [],
        shifts: generationShifts,
        holidays: [],
        leaveRequests: [],
        allocation: {},
        coverage: {},
        validation: [],
        summary: {
          totalEmployees: employeePool,
          totalShifts: generationShifts.length,
          totalDays: dates.length,
          totalSlots: requiredSlots,
          storeClosedDays: location.closedDay ? rosterDays - 1 : 0,
        },
      };
    }

    function renderRosterReview(result) {
      const s = result.summary || {};
      const totalSlots = s.totalSlots || 0;
      const filledSlots = s.totalEmployees && s.totalShifts
        ? Math.min(s.totalEmployees * s.totalDays, totalSlots)
        : 0;
      const openSlots = Math.max(0, totalSlots - filledSlots);
      const conflictCount = Object.values(result.validation || []).filter(v => v?.type === "block").length;
      const warningCount = Object.values(result.validation || []).filter(v => v?.type === "warning").length;

      const summaryCards = [
        ["Total Employees", String(s.totalEmployees || 0), "Assigned to location", "users-round", "blue"],
        ["Total Slots", String(totalSlots), `${s.totalDays || 0} days × ${s.totalShifts || 0} shifts`, "calendar-check-2", "blue"],
        ["Filled Slots", String(filledSlots), "Tentative assignments", "user-check", "green"],
        ["Open Slots", String(openSlots), "Requires manual review", "user-round-x", openSlots ? "amber" : "grey"],
        ["Conflicts", String(conflictCount + warningCount), `${conflictCount} block, ${warningCount} warning`, "triangle-alert", conflictCount ? "red" : warningCount ? "amber" : "green"],
        ["Leave Conflicts", String((result.leaveRequests || []).length), "Within roster period", "calendar-off", "amber"],
      ];
      $("#rosterPreviewSummary").innerHTML = `
        <div class="roster-preview-cards">${summaryCards.map(item => `
          <article class="roster-preview-card">
            <span class="roster-preview-icon ${item[4]}"><i data-lucide="${item[3]}"></i></span>
            <div>
              <div class="preview-card-label">${item[0]}</div>
              <div class="preview-card-value">${item[1]}</div>
              <div class="preview-card-note">${item[2]}</div>
            </div>
          </article>
        `).join("")}</div>
        <div class="roster-preview-context">
          <span class="badge blue">${result.location?.listName || "Location"}</span>
          <span>${formatShortDate(result.period?.start)} — ${formatShortDate(result.period?.end)}</span>
          <span>${s.totalEmployees || 0} employees · ${(result.shifts || []).length} shifts · ${s.totalDays || 0} days</span>
        </div>
      `;

      renderRosterCoverageGrid(result);
      renderRosterValidationPanel(result);
      renderRosterAllocationTable(result);
      refreshIcons();
    }

    function renderRosterCoverageGrid(result) {
      const coverage = result.coverage || {};
      const dates = result.dates || [];
      const container = $("#rosterCoverageGrid");
      let html = "";
      for (const dateObj of dates) {
        const iso = dateObj.iso;
        const dayCoverage = coverage[iso];
        const shiftBlocks = (dayCoverage?.shifts || []).map(cs => {
          const gap = Number(cs.gap) || 0;
          const tone = gap > 0 ? "amber" : "green";
          return `<div class="coverage-shift-block ${tone}">
            <span class="coverage-shift-name">${cs.policy_name || cs.shift_type}</span>
            <span class="coverage-shift-counts">${cs.allocated || 0}/${cs.sanctioned}</span>
            ${gap > 0 ? `<span class="coverage-gap">Gap ${gap}</span>` : ""}
          </div>`;
        }).join("");
        const holidayTag = dayCoverage?.isStoreClosed
          ? `<span class="badge red">Closed: ${dayCoverage.holidayName || "Holiday"}</span>`
          : dayCoverage?.isHoliday
            ? `<span class="badge amber">${dayCoverage.holidayName || "Holiday"}</span>`
            : "";
        html += `<div class="coverage-day-card">
          <div class="coverage-day-head">
            <span class="coverage-day-label">${dateObj.dayName} ${dateObj.label}</span>
            ${holidayTag}
          </div>
          <div class="coverage-day-shifts">${shiftBlocks || `<span class="coverage-empty">No shifts configured</span>`}</div>
        </div>`;
      }
      container.innerHTML = html || `<div class="roster-panel-empty"><i data-lucide="calendar-x"></i><span>No coverage data available</span></div>`;
    }

    function renderRosterValidationPanel(result) {
      const container = $("#rosterValidationPanel");
      const coverage = result.coverage || {};
      const dates = result.dates || [];
      const validation = result.validation || [];
      const checks = [];

      for (const dateObj of dates) {
        const iso = dateObj.iso;
        const dayCoverage = coverage[iso];
        if (!dayCoverage) continue;

        if (dayCoverage.isStoreClosed) {
          checks.push({ type: "block", check: "Store Closed", date: iso, detail: `${dayCoverage.holidayName || "Holiday"} — store is closed.` });
        }

        for (const cs of (dayCoverage.shifts || [])) {
          const gap = Number(cs.gap) || 0;
          if (gap > 0) {
            checks.push({
              type: "warning",
              check: "Staffing Gap",
              date: iso,
              detail: `${cs.policy_name}: ${gap} slot${gap > 1 ? "s" : ""} short of sanctioned strength (${cs.allocated}/${cs.sanctioned}).`,
            });
          }
          if (cs.keyholder_required && !cs.keyholder_allocated) {
            checks.push({
              type: "block",
              check: "Keyholder Missing",
              date: iso,
              detail: `${cs.policy_name} requires keyholder — none assigned.`,
            });
          }
        }
      }

      const allChecks = [...checks, ...validation];

      if (!allChecks.length) {
        container.innerHTML = `<div class="roster-panel-empty"><i data-lucide="shield-check"></i><span>All checks passed — no issues detected.</span></div>`;
        return;
      }

      container.innerHTML = allChecks.map(ch => {
        const tone = ch.type === "block" ? "red" : ch.type === "warning" ? "amber" : "green";
        const label = ch.type === "block" ? "Block" : ch.type === "warning" ? "Warning" : "Pass";
        return `<div class="validation-row ${tone}">
          <span class="validation-icon"><i data-lucide="${tone === "red" ? "circle-x" : tone === "amber" ? "triangle-alert" : "circle-check"}"></i></span>
          <div class="validation-content">
            <div class="validation-title">${ch.check}</div>
            <div class="validation-detail">${ch.detail || ""}${ch.date ? ` <span class="validation-date">${ch.date}</span>` : ""}</div>
          </div>
          <span class="badge ${tone}">${label}</span>
        </div>`;
      }).join("");
    }

    function renderRosterAllocationTable(result) {
      const allocation = result.allocation || {};
      const dates = result.dates || [];
      const employees = result.employees || [];
      const thead = $("#rosterAllocationHead");
      const tbody = $("#rosterAllocationBody");

      if (!dates.length) {
        thead.innerHTML = "";
        tbody.innerHTML = `<tr><td colspan="10"><div class="roster-panel-empty"><i data-lucide="table"></i><span>No allocation data available</span></div></td></tr>`;
        return;
      }

      const headerCells = `<th class="allocation-emp-cell">Employee</th>${dates.map(d => `<th class="allocation-date-cell">${d.dayName}<br><span class="allocation-date-label">${d.label.replace(" ", "<br>")}</span></th>`).join("")}`;
      thead.innerHTML = `<tr>${headerCells}</tr>`;

      const empList = employees.length ? employees : Object.keys(allocation);
      const bodyRows = empList.map(emp => {
        const empLabel = typeof emp === "object" ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || String(emp.employee_id) : emp;
        const empId = typeof emp === "object" ? emp.employee_id : emp;
        const empAlloc = allocation[empId] || {};
        const cells = dates.map(d => {
          const alloc = empAlloc[d.iso];
          if (!alloc || !alloc.shift) {
            const type = alloc?.type;
            if (type === "weekly_off") return `<td class="allocation-cell wo" title="Weekly Off"><span>WO</span></td>`;
            if (type === "leave") return `<td class="allocation-cell leave" title="Leave"><span>L</span></td>`;
            if (type === "store_closed") return `<td class="allocation-cell closed" title="Store Closed"><span>—</span></td>`;
            return `<td class="allocation-cell open" title="Unassigned"><span>?</span></td>`;
          }
          const cellClass = alloc.source === "preferred" ? "preferred" : "auto";
          return `<td class="allocation-cell ${cellClass}" title="${alloc.shift}"><span>${alloc.shiftType?.slice(0, 3) || alloc.shift?.slice(0, 3) || "SFT"}</span></td>`;
        }).join("");
        return `<tr><td class="allocation-emp-cell">${empLabel}</td>${cells}</tr>`;
      }).join("");
      tbody.innerHTML = bodyRows;
    }

    function validateOperatingHourRow(row) {
      if (!row.isOpen) {
        return { valid: true, status: "Closed", message: "" };
      }

      const values = [row.officialOpen, row.officialClose, row.operationalOpen, row.operationalClose];
      if (values.some(value => !value)) {
        return {
          valid: false,
          status: "Missing Hours",
          message: "Complete all four time fields for an open day."
        };
      }

      const officialOpen = timeToMinutes(row.officialOpen);
      const officialClose = timeToMinutes(row.officialClose);
      const operationalOpen = timeToMinutes(row.operationalOpen);
      const operationalClose = timeToMinutes(row.operationalClose);

      if (officialOpen >= officialClose) {
        return {
          valid: false,
          status: "Invalid Order",
          message: "Official open time must be earlier than official close time."
        };
      }

      if (operationalOpen >= operationalClose) {
        return {
          valid: false,
          status: "Invalid Order",
          message: "Operational open time must be earlier than operational close time."
        };
      }

      const outsideOperationalHours = officialOpen < operationalOpen || officialClose > operationalClose;

      if (outsideOperationalHours) {
        return {
          valid: false,
          status: "Outside Range",
          message: "Official hours must remain within operational hours."
        };
      }

      return { valid: true, status: "Valid", message: "" };
    }

    function validateOperatingHours(records) {
      const results = records.map(row => ({ row, ...validateOperatingHourRow(row) }));
      const invalid = results.filter(result => !result.valid);
      return {
        valid: invalid.length === 0,
        results,
        message: invalid.length
          ? `${invalid.length} day${invalid.length === 1 ? "" : "s"} require correction before saving.`
          : "Official hours are within operational hours for every open day."
      };
    }

    function operatingHoursForLocation(location) {
      if (!location.operatingHoursRecords) {
        location.operatingHoursRecords = buildOperatingHourRecords(location);
      }
      return location.operatingHoursRecords;
    }

    function startHoursEdit() {
      const location = getSelectedLocation();
      hoursDraft = operatingHoursForLocation(location).map(row => ({ ...row }));
      hoursEditMode = true;
      renderLocationTab();
    }

    function cancelHoursEdit() {
      hoursEditMode = false;
      hoursDraft = null;
      renderLocationTab();
      showToast("Unsaved operating-hour changes were discarded.");
    }

    function saveHoursEdit() {
      const validation = validateOperatingHours(hoursDraft || []);
      if (!validation.valid) {
        renderLocationTab();
        showToast("Correct the operating-hour warnings before saving.");
        return;
      }

      const location = getSelectedLocation();
      location.operatingHoursRecords = hoursDraft.map(row => ({ ...row }));
      const firstOpenDay = location.operatingHoursRecords.find(row => row.isOpen);
      location.hoursConfigured = Boolean(firstOpenDay);
      location.officialHours = firstOpenDay
        ? formatHourRange(firstOpenDay.officialOpen, firstOpenDay.officialClose)
        : "Not configured";
      location.operationalHours = firstOpenDay
        ? formatHourRange(firstOpenDay.operationalOpen, firstOpenDay.operationalClose)
        : "Not configured";
      const closedDays = location.operatingHoursRecords.filter(row => !row.isOpen);
      location.closedDay = closedDays.length === 1 ? closedDays[0].dayName : null;
      hoursEditMode = false;
      hoursDraft = null;
      renderLocationTab();
      showToast(`${location.listName} operating hours saved.`);
    }

    function renderHoursTab(location) {
      const records = hoursEditMode
        ? hoursDraft
        : operatingHoursForLocation(location);
      const validation = validateOperatingHours(records);
      const actions = hoursEditMode
        ? `<button class="button" data-control-action="cancel-hours">Cancel</button>
           <button class="button primary" data-control-action="save-hours"><i data-lucide="save"></i>Save Hours</button>`
        : `<button class="button" data-control-action="copy-hours"><i data-lucide="copy"></i>Copy From</button>
           <button class="button primary" data-control-action="edit-hours"><i data-lucide="pencil"></i>Edit Hours</button>`;
      return `
        ${tabHeader(hoursEditMode ? "Editing Operating Hours" : "Operating Hours",
          "Official and operational hours for each day of the week.",
          actions)}
        <div class="control-table-wrap">
          <table class="control-table ${hoursEditMode ? "is-hours-editing" : ""}">
            <thead>
              ${hoursEditMode
                ? `<tr>
                    <th>Day of Week</th><th>Open?</th>
                    <th>Official Open Time</th><th>Official Close Time</th>
                    <th>Operational Open Time</th><th>Operational Close Time</th>
                    <th>Status</th><th class="action-cell">Action</th>
                  </tr>`
                : `<tr><th>Day of Week</th><th>Open?</th><th>Official Hours</th><th>Operational Hours</th><th>Status</th><th class="action-cell">Action</th></tr>`}
            </thead>
            <tbody>
              ${records.map(row => {
                const rowValidation = validateOperatingHourRow(row);
                const badgeTone = rowValidation.status === "Valid"
                  ? "green"
                  : rowValidation.status === "Closed"
                    ? "grey"
                    : "red";
                return `
                  <tr class="hours-row ${rowValidation.valid ? "" : "is-invalid"}" data-hours-day="${row.dayOfWeek}">
                    <td>${row.dayName}</td>
                    <td>
                      <button class="switch hours-switch ${row.isOpen ? "is-on" : ""}"
                        type="button"
                        ${hoursEditMode ? "" : "disabled"}
                        aria-label="${row.isOpen ? "Open" : "Closed"} on ${row.dayName}"
                        data-day-of-week="${row.dayOfWeek}"></button>
                    </td>
                    ${hoursEditMode
                      ? `
                        <td>${renderSplitTimeControl({ value: row.officialOpen, field: "officialOpen", dayOfWeek: row.dayOfWeek, disabled: !row.isOpen, label: `${row.dayName} official open time` })}</td>
                        <td>${renderSplitTimeControl({ value: row.officialClose, field: "officialClose", dayOfWeek: row.dayOfWeek, disabled: !row.isOpen, label: `${row.dayName} official close time` })}</td>
                        <td>${renderSplitTimeControl({ value: row.operationalOpen, field: "operationalOpen", dayOfWeek: row.dayOfWeek, disabled: !row.isOpen, label: `${row.dayName} operational open time` })}</td>
                        <td>${renderSplitTimeControl({ value: row.operationalClose, field: "operationalClose", dayOfWeek: row.dayOfWeek, disabled: !row.isOpen, label: `${row.dayName} operational close time` })}</td>
                      `
                      : `
                        <td>${row.isOpen ? formatHourRange(row.officialOpen, row.officialClose) : "Closed"}</td>
                        <td>${row.isOpen ? formatHourRange(row.operationalOpen, row.operationalClose) : "Closed"}</td>
                      `}
                    <td>
                      <span class="badge ${badgeTone}">${rowValidation.status}</span>
                      ${hoursEditMode && rowValidation.message ? `<div class="hours-row-error">${rowValidation.message}</div>` : ""}
                    </td>
                    <td class="action-cell">${hoursEditMode ? "—" : `<button class="row-menu-button" data-control-action="row-menu" aria-label="Actions for ${row.dayName}"><i data-lucide="ellipsis-vertical"></i></button>`}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        <div class="validation-summary ${validation.valid ? "" : "is-error"}">
          <div class="validation-copy">
            <span class="validation-icon"><i data-lucide="${validation.valid ? "check" : "triangle-alert"}"></i></span>
            <div>
              <div class="validation-title">Validation Summary</div>
              <div class="validation-text">${validation.message}</div>
            </div>
          </div>
          ${hoursEditMode ? "" : `<button class="button" data-control-action="view-validation">View Details</button>`}
        </div>
      `;
    }

    function renderServicesTab(location) {
      return `
        ${tabHeader("Location Service Config", "Services currently configured for the selected location.",
          `<button class="button primary" data-control-action="add-service"><i data-lucide="plus"></i>Add Service Config</button>`)}
        ${location.services.length ? `
          <div class="control-table-wrap">
            <table class="control-table">
              <thead><tr><th>Service Code</th><th>Service</th><th>Service Mode</th><th>Status</th><th class="action-cell">Action</th></tr></thead>
              <tbody>
                ${location.services.map(service => `
                  <tr>
                    <td>${service[0]}</td><td>${service[1]}</td><td>${service[2]}</td>
                    <td><span class="badge ${statusClass[service[3]] || "grey"}">${service[3]}</span></td>
                    <td class="action-cell"><button class="row-menu-button" data-control-action="row-menu" aria-label="Actions for ${service[1]}"><i data-lucide="ellipsis-vertical"></i></button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>` : `<div class="location-empty">No location service configuration applies to this office.</div>`}
      `;
    }

    function renderDeliveryTab(location) {
      return `
        ${tabHeader("Delivery Zone", "Delivery zones configured for the selected location.",
          `<button class="button primary" data-control-action="add-zone"><i data-lucide="plus"></i>Add Delivery Zone</button>`)}
        ${location.deliveryZones.length ? `
          <div class="control-table-wrap">
            <table class="control-table">
              <thead><tr><th>Zone ID</th><th>Zone Name</th><th>Service Radius</th><th>Coverage</th><th>Status</th><th class="action-cell">Action</th></tr></thead>
              <tbody>
                ${location.deliveryZones.map(zone => `
                  <tr>
                    ${zone.map((cell, index) => `<td>${index === 4 ? `<span class="badge ${statusClass[cell] || "grey"}">${cell}</span>` : cell}</td>`).join("")}
                    <td class="action-cell"><button class="row-menu-button" data-control-action="row-menu" aria-label="Delivery zone actions"><i data-lucide="ellipsis-vertical"></i></button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>` : `<div class="location-empty">No delivery zone is configured for this location.</div>`}
      `;
    }

    function renderOnboardingTab(location) {
      const complete = location.readiness >= 80;
      const rows = [
        ["Location Record", "HR & Admin", "Completed"],
        ["Operating Hours", "Operations", "Completed"],
        ["Service Configuration", "Operations", location.services.length || location.type === "Head Office" ? "Completed" : "In Progress"],
        ["Shift Policy", "HR & Admin", location.shifts.length ? "Completed" : "In Progress"],
        ["Roster Readiness", "Location Manager", complete ? "Completed" : "In Progress"]
      ];
      return `
        ${tabHeader("Location Onboarding Checklist", "Setup readiness for the selected location.",
          `<button class="button" data-control-action="refresh-checklist"><i data-lucide="refresh-cw"></i>Refresh Status</button>`)}
        <div class="control-table-wrap">
          <table class="control-table">
            <thead><tr><th>Setup Area</th><th>Owner</th><th>Completion</th><th>Status</th><th class="action-cell">Action</th></tr></thead>
            <tbody>
              ${rows.map((row, index) => `
                <tr>
                  <td><span class="check-cell"><span class="check-icon ${row[2] === "Completed" ? "" : "pending"}"><i data-lucide="${row[2] === "Completed" ? "check" : "clock-3"}"></i></span>${row[0]}</span></td>
                  <td>${row[1]}</td>
                  <td>${row[2] === "Completed" ? "100%" : `${Math.max(40, location.readiness - index * 4)}%`}</td>
                  <td><span class="badge ${statusClass[row[2]] || "grey"}">${row[2]}</span></td>
                  <td class="action-cell"><button class="row-menu-button" data-control-action="row-menu" aria-label="Checklist actions"><i data-lucide="ellipsis-vertical"></i></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderShiftPolicyTab(location) {
      const rows = shiftRowsForLocation(location);
      const fallback = fallbackShiftForLocation(location);
      return `
        ${tabHeader("Location Shift Policy", "Shift policies assigned to the selected location.",
          `<button class="button primary" data-control-action="add-shift-policy"><i data-lucide="plus"></i>Add Shift Policy</button>`)}
        <div class="control-table-wrap">
          <table class="control-table">
            <thead><tr><th>Policy ID</th><th>Shift</th><th>Timing</th><th>Sanctioned Strength</th><th>Weekly Off</th><th>Coverage Role</th><th>Status</th><th class="action-cell">Action</th></tr></thead>
            <tbody>
              ${rows.map(shift => `
                <tr>
                  <td>${shift[0]}</td>
                  <td>${shift[1]}</td>
                  <td>${shift[2]}</td>
                  <td>${shift[3]}</td>
                  <td>${shift[4]}</td>
                  <td><span class="badge ${shiftCoverageRole(shift) === "Fallback" ? "blue" : "grey"}">${shiftCoverageRole(shift)}</span></td>
                  <td><span class="badge ${statusClass[shift[5]] || "grey"}">${shift[5]}</span></td>
                  <td class="action-cell"><button class="row-menu-button" data-control-action="row-menu" aria-label="Shift policy actions"><i data-lucide="ellipsis-vertical"></i></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${fallback ? `
          <div class="validation-summary is-info">
            <div class="validation-copy">
              <span class="validation-icon"><i data-lucide="route"></i></span>
              <div>
                <div class="validation-title">Fallback Coverage Enabled</div>
                <div class="validation-text">If normal shift coverage cannot be met, roster generation can use ${fallback[1]} (${fallback[2]}) for this location.</div>
              </div>
            </div>
          </div>
        ` : ""}
      `;
    }

    function renderLocationAuditTab(location) {
      const rows = [
        ["15 Jun 2026, 12:06 AM", "Vikram Admin", "Sub Location", `Opened ${location.listName} control center`, "Posted"],
        ["14 Jun 2026, 09:42 PM", "HR Admin", "Operating Hours", "Reviewed weekly operating hours", "Approved"],
        ["14 Jun 2026, 08:15 PM", "Operations Admin", "Shift Policy", "Updated roster generation settings", "Override"],
        ["12 Jun 2026, 04:30 PM", "System", "Onboarding Checklist", "Recalculated location readiness", "Posted"]
      ];
      return `
        ${tabHeader("Audit Log", "Recent setup activity for the selected location.",
          `<button class="button" data-control-action="export-audit"><i data-lucide="download"></i>Export Audit</button>`)}
        <div class="control-table-wrap">
          <table class="control-table">
            <thead><tr><th>Timestamp</th><th>Actor</th><th>Area</th><th>Action</th><th>Status</th></tr></thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map((cell, index) => `<td>${index === 4 ? `<span class="badge ${statusClass[cell] || "grey"}">${cell}</span>` : cell}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderLocationTab() {
      const location = getSelectedLocation();
      const renderers = {
        overview: renderOverviewTab,
        hours: renderHoursTab,
        services: renderServicesTab,
        delivery: renderDeliveryTab,
        onboarding: renderOnboardingTab,
        "shift-policy": renderShiftPolicyTab,
        audit: renderLocationAuditTab
      };
      $("#locationTabContent").innerHTML = renderers[activeLocationTab](location);
      $$(".location-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.locationTab === activeLocationTab));
      refreshIcons();
    }

    function renderLocationControl() {
      if (!subLocations.length) {
        renderLocationKpis();
        renderLocationList();
        return;
      }
      const location = getSelectedLocation();
      renderLocationKpis();
      renderLocationList();
      renderLocationMeta(location);
      renderLocationTab();
    }

    const DEFAULT_SHIFT_POLICIES = [
      { policy_name: "Opening Shift", shift_type: "Opening", coverage_mode: "Standard", shift_start_time: "06:00", shift_end_time: "14:00", break_duration_minutes: 60, sanctioned_strength: 4, keyholder_required: false, weekly_off_pattern: "Rotational", max_consecutive_days: 6, policy_status: "Active" },
      { policy_name: "Closing Shift", shift_type: "Closing", coverage_mode: "Standard", shift_start_time: "14:00", shift_end_time: "22:00", break_duration_minutes: 60, sanctioned_strength: 4, keyholder_required: false, weekly_off_pattern: "Rotational", max_consecutive_days: 6, policy_status: "Active" }
    ];

    function emptyLocationRecord() {
      return {
        location_code: "",
        parent_entity_id: "",
        location_name: "",
        brand_flag: "",
        location_type: "",
        address_line1: "",
        city: "",
        pincode: "",
        state: "",
        state_code: "",
        latitude: "",
        longitude: "",
        phone: "",
        email: "",
        cost_centre_code: "",
        area_manager_id: "",
        primary_keyholder_id: "",
        backup_keyholder_id: "",
        onboarding_status: "",
        status: "",
        shift_policies: []
      };
    }

    function clearLocationFormError() {
      $("#locationFormError").classList.remove("is-visible");
      $$("[data-location-field]").forEach(field => field.removeAttribute("aria-invalid"));
    }

    function showLocationFormError(message, fields = []) {
      $("#locationFormErrorText").textContent = message;
      $("#locationFormError").classList.add("is-visible");
      fields.forEach(field => field.setAttribute("aria-invalid", "true"));
      $("#locationFormError").scrollIntoView({ behavior: "smooth", block: "center" });
      refreshIcons();
    }

    function populateLocationForm(record) {
      clearLocationFormError();
      $$("[data-location-field]").forEach(field => {
        field.value = record[field.dataset.locationField] ?? "";
      });
      renderShiftPolicyCards(record.shift_policies || []);
      setLocationStep(0);
    }

    function collectLocationFormRecord() {
      const record = $$("[data-location-field]").reduce((r, field) => {
        r[field.dataset.locationField] = field.value.trim();
        return r;
      }, {});
      record.shift_policies = collectShiftPolicies();
      return record;
    }

    function buildLocationFromRecord(record) {
      const location = {
        id: record.location_code || String(Date.now()),
        name: record.brand_flag || record.location_name,
        listName: record.location_name,
        parent: parentEntities[record.parent_entity_id] || record.parent_entity_id,
        parentCode: record.parent_entity_id,
        state: record.state || "Not set",
        type: locationTypeLabel(record.location_type),
        status: titleCaseValue(record.status),
        readiness: 20,
        readinessLabel: titleCaseValue(record.onboarding_status),
        readinessTone: "attention",
        officialHours: "Not configured",
        operationalHours: "Not configured",
        closedDay: null,
        hoursConfigured: false,
        services: [],
        deliveryZones: [],
        shifts: record.shift_policies || [],
        record: { ...record }
      };
      location.operatingHoursRecords = buildOperatingHourRecords(location);
      return location;
    }

    function applyLocationRecord(location, record) {
      location.id = record.location_code || location.id;
      location.name = record.brand_flag || record.location_name;
      location.listName = record.location_name;
      location.parent = parentEntities[record.parent_entity_id] || record.parent_entity_id;
      location.parentCode = record.parent_entity_id;
      location.state = record.state || "Not set";
      location.type = locationTypeLabel(record.location_type);
      location.status = titleCaseValue(record.status);
      location.shifts = record.shift_policies || [];
      location.record = { ...record };
    }

    function createShiftPolicyCardHTML(policy, index) {
      const types = ["Opening", "Closing", "Mid", "General"];
      const statuses = ["Active", "Draft", "Inactive"];
      const coverages = ["Standard", "Fallback"];

      function opt(selected, list) {
        return list.map(v => `<option value="${v}"${v === selected ? " selected" : ""}>${v}</option>`).join("");
      }

      return `
        <div class="shift-policy-card" data-sp-index="${index}">
          <div class="shift-policy-card-grid">
            <label class="location-form-field">
              <span class="location-form-label">Shift Name</span>
              <input data-sp-field="policy_name" value="${policy.policy_name || ""}" placeholder="e.g. Opening Shift">
            </label>
            <label class="location-form-field">
              <span class="location-form-label">Shift Type</span>
              <select data-sp-field="shift_type">${opt(policy.shift_type, types)}</select>
            </label>
            <label class="location-form-field">
              <span class="location-form-label">Start Time</span>
              <input data-sp-field="shift_start_time" type="time" value="${policy.shift_start_time || "06:00"}">
            </label>
            <label class="location-form-field">
              <span class="location-form-label">End Time</span>
              <input data-sp-field="shift_end_time" type="time" value="${policy.shift_end_time || "14:00"}">
            </label>
            <button class="icon-button remove-shift-policy" type="button" title="Remove shift" data-sp-remove="${index}"><i data-lucide="trash-2"></i></button>
          </div>
          <div class="shift-policy-card-grid" style="margin-top: 10px;">
            <label class="location-form-field">
              <span class="location-form-label">Break (min)</span>
              <input data-sp-field="break_duration_minutes" type="number" min="0" step="15" value="${policy.break_duration_minutes ?? 60}">
            </label>
            <label class="location-form-field">
              <span class="location-form-label">Staff Required</span>
              <input data-sp-field="sanctioned_strength" type="number" min="1" step="1" value="${policy.sanctioned_strength ?? 4}">
            </label>
            <label class="location-form-field">
              <span class="location-form-label">Status</span>
              <select data-sp-field="policy_status">${opt(policy.policy_status || "Active", statuses)}</select>
            </label>
            <label class="location-form-field">
              <span class="location-form-label">Coverage</span>
              <select data-sp-field="coverage_mode">${opt(policy.coverage_mode || "Standard", coverages)}</select>
            </label>
          </div>
        </div>`;
    }

    function renderShiftPolicyCards(policies) {
      const container = $("#shiftPolicyCardList");
      if (!container) return;
      if (!policies || policies.length === 0) {
        policies = DEFAULT_SHIFT_POLICIES;
      }
      container.innerHTML = policies.map((p, i) => createShiftPolicyCardHTML(p, i)).join("");
      $$("#shiftPolicyCardList .remove-shift-policy").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.spRemove);
          removeShiftPolicyCard(idx);
        });
      });
      refreshIcons();
    }

    function collectShiftPolicies() {
      const cards = $$("#shiftPolicyCardList .shift-policy-card");
      return cards.map(card => {
        const fields = {};
        card.querySelectorAll("[data-sp-field]").forEach(el => {
          fields[el.dataset.spField] = el.value.trim();
        });
        return fields;
      }).filter(p => p.policy_name);
    }

    function removeShiftPolicyCard(index) {
      const cards = $$("#shiftPolicyCardList .shift-policy-card");
      if (cards.length <= 1) {
        showLocationFormError("At least one shift policy is required.");
        return;
      }
      const card = cards.find(c => Number(c.dataset.spIndex) === index);
      if (card) card.remove();
      // re-index remaining cards
      $$("#shiftPolicyCardList .shift-policy-card").forEach((c, i) => {
        c.dataset.spIndex = i;
        const removeBtn = c.querySelector(".remove-shift-policy");
        if (removeBtn) removeBtn.dataset.spRemove = i;
      });
    }

    function addShiftPolicyCard() {
      const policies = collectShiftPolicies();
      const newPolicy = { policy_name: "", shift_type: "General", coverage_mode: "Standard", shift_start_time: "09:00", shift_end_time: "17:00", break_duration_minutes: 60, sanctioned_strength: 2, policy_status: "Active" };
      policies.push(newPolicy);
      renderShiftPolicyCards(policies);
    }

    function setLocationFormHeader(mode) {
      const isEdit = mode === "edit";
      setBreadcrumb(["HRMS", "Organization", "Sub Location Control Center", isEdit ? "Edit Location" : "Add New Location"]);
      $("#pageTitle").textContent = isEdit ? "Edit Sub Location" : "Create New Sub Location";
      $("#pageDescription").textContent = isEdit
        ? "Update the existing base location record. Related location setup remains available in the Sub Location Control Center."
        : "Create the base location record with shift policies included. Fine-tune operating hours, services, and delivery zones from the Sub Location Control Center.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Sub Location Control Center`;
      $("#modalTitle").textContent = isEdit ? "Edit Sub Location" : "Create New Sub Location";
      $("#modalSubtitle").textContent = "Sub Location Master";
    }

    function openLocationForm(mode) {
      locationFormMode = mode;
      editingLocationId = mode === "edit" ? selectedLocationId : null;
      activePage = "sub-location-form";
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      const target = $('.nav-child[data-page="sub-location"]');
      target.classList.add("is-active");
      openGroup(target.closest(".nav-group"), true);
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#moduleView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#employeeFormView").classList.remove("is-active");
      $("#locationFormView").classList.add("is-active");
      setLocationFormHeader(mode);
      const base = emptyLocationRecord();
      if (mode === "edit") {
        const loc = getSelectedLocation();
        Object.assign(base, loc.record);
        base.shift_policies = loc.shifts && loc.shifts.length > 0
          ? loc.shifts.map(s => s.policy_id ? { ...s } : s)
          : DEFAULT_SHIFT_POLICIES;
      } else {
        base.shift_policies = DEFAULT_SHIFT_POLICIES;
      }
      populateLocationForm(base);
      $("#submitLocationForm").innerHTML = `<i data-lucide="save"></i>${mode === "edit" ? "Save Changes" : "Create Location"}`;
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function setLocationStep(stepIndex) {
      activeLocationStep = Math.max(0, Math.min(4, stepIndex));
      $$("#locationStepper [data-location-step]").forEach((step, index) => {
        step.classList.toggle("is-active", index === activeLocationStep);
        step.classList.toggle("is-complete", index < activeLocationStep);
      });
      $$("[data-location-section]").forEach((section, index) => {
        section.classList.toggle("is-active", index === activeLocationStep);
      });
      $("#backLocationStep").disabled = activeLocationStep === 0;
      $("#nextLocationStep").hidden = activeLocationStep === 4;
      $("#submitLocationForm").hidden = activeLocationStep !== 4;
      clearLocationFormError();
      refreshIcons();
    }

    async function loadParentEntityOptions() {
      const select = document.getElementById("locationParentEntity");
      if (!select) return;
      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;
        let entities = [];
        if (mode === "api" && api) {
          entities = await api.entities.list();
        }
        if (entities.length === 0) {
          entities = Object.entries(parentEntities).map(([code, name]) => ({
            entity_code: code, legal_name: name
          }));
        }
        select.innerHTML = '<option value="">Select parent entity</option>';
        entities.forEach(e => {
          const opt = document.createElement("option");
          opt.value = e.entity_code || String(e.entity_id);
          opt.dataset.entityId = e.entity_id || "";
          opt.textContent = `${e.entity_code} - ${e.legal_name}`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Select parent entity</option>';
      }
    }

    async function loadEmployeesByEntity(entityId) {
      if (!entityId) {
        ["locationAreaManager", "locationPrimaryKeyholder", "locationBackupKeyholder"].forEach(id => {
          const sel = document.getElementById(id);
          if (sel) sel.innerHTML = `<option value="">No ${id.replace("location", "").replace(/([A-Z])/g, " $1").toLowerCase().trim()} selected</option>`;
        });
        return;
      }
      try {
        const response = await fetch(`/api/parent-entities/${entityId}/employees`);
        if (!response.ok) return;
        const employees = await response.json();
        const labels = {
          locationAreaManager: "area manager",
          locationPrimaryKeyholder: "primary keyholder",
          locationBackupKeyholder: "backup keyholder"
        };
        Object.entries(labels).forEach(([id, label]) => {
          const sel = document.getElementById(id);
          if (!sel) return;
          const currentValue = sel.value;
          sel.innerHTML = `<option value="">No ${label} selected</option>`;
          employees.forEach(emp => {
            const opt = document.createElement("option");
            opt.value = emp.employee_id;
            opt.textContent = `${emp.employee_code} - ${emp.first_name} ${emp.last_name}`;
            sel.appendChild(opt);
          });
          if (currentValue) sel.value = currentValue;
        });
      } catch {
        // silently fail
      }
    }

    async function loadStateOptions() {
      const select = document.getElementById("locationState");
      if (!select) return;
      try {
        const response = await fetch("/api/states");
        if (!response.ok) return;
        const states = await response.json();
        select.innerHTML = '<option value="">Select state</option>';
        states.forEach(s => {
          const opt = document.createElement("option");
          opt.value = s.state_name;
          opt.dataset.code = s.state_code;
          opt.textContent = `${s.state_name} (${s.state_code})`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Select state</option>';
      }
    }

    async function loadDepartmentOptions() {
      const select = document.getElementById("designationDepartment");
      if (!select) return;
      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;
        let departments = [];
        if (mode === "api" && api) {
          departments = await api.departments.list();
        }
        if (departments.length === 0) {
          departments = Object.entries(pageConfig["department-master"].rows).map(([, r]) => ({
            department_id: r[0]?.replace(/\D/g, "") || "",
            department_name: r[1] || "",
            department_code: r[0] || ""
          }));
        }
        select.innerHTML = '<option value="">Select department</option>';
        departments.forEach(d => {
          const opt = document.createElement("option");
          opt.value = d.department_id;
          opt.textContent = `${d.department_code} - ${d.department_name}`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Select department</option>';
      }
    }

    async function loadRoleOptions() {
      const select = document.getElementById("employeeRole");
      if (!select) return;
      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;
        let roles = [];
        if (mode === "api" && api) {
          roles = await api.roles.list();
        }
        if (roles.length === 0) {
          roles = pageConfig["role-manager"].rows.map(r => ({
            role_code: r[0],
            role_name: r[1]
          }));
        }
        select.innerHTML = '<option value="">Not assigned</option>';
        roles.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r.role_code || String(r.role_id);
          opt.textContent = `${r.role_code || r.role_name} - ${r.role_name}`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Not assigned</option>';
      }
    }

    async function loadEntityOptions() {
      const select = document.querySelector('[data-employee-field="parent_entity_id"]');
      if (!select) return;
      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;
        let entities = [];
        if (mode === "api" && api) {
          entities = await api.entities.list();
        }
        if (entities.length === 0) {
          entities = Object.entries(parentEntities).map(([code, name]) => ({
            entity_code: code, legal_name: name
          }));
        }
        select.innerHTML = '<option value="">Select legal entity</option>';
        entities.forEach(e => {
          const opt = document.createElement("option");
          opt.value = e.entity_code || String(e.entity_id);
          opt.dataset.entityId = e.entity_id || "";
          opt.textContent = `${e.entity_code} - ${e.legal_name}`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Select legal entity</option>';
      }
    }

    async function loadEmployeeLocationOptions() {
      const entitySelect = document.querySelector('[data-employee-field="parent_entity_id"]');
      const locationSelect = document.querySelector('[data-employee-field="location_id"]');
      if (!entitySelect || !locationSelect) return;
      const updateLocations = async () => {
        const entityCode = entitySelect.value;
        if (!entityCode) {
          locationSelect.innerHTML = '<option value="">Select legal entity first</option>';
          return;
        }
        try {
          const locs = subLocations.filter(l => l.parentCode === entityCode || String(l.dbId) === entityCode);
          locationSelect.innerHTML = '<option value="">Select location</option>';
          locs.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l.id;
            opt.textContent = `${l.id} - ${l.listName || l.name}`;
            locationSelect.appendChild(opt);
          });
        } catch {
          locationSelect.innerHTML = '<option value="">Select location</option>';
        }
      };
      entitySelect.removeEventListener("change", updateLocations);
      entitySelect.addEventListener("change", updateLocations);
      await updateLocations();
    }

    async function loadEmployeeDepartmentOptions() {
      const select = document.querySelector('[data-employee-field="department_id"]');
      if (!select) return;
      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;
        let departments = [];
        if (mode === "api" && api) {
          departments = await api.departments.list();
        }
        if (departments.length === 0) {
          departments = pageConfig["department-master"].rows.map(r => ({
            department_id: r[0],
            department_name: r[1],
            department_code: r[0]
          }));
        }
        select.innerHTML = '<option value="">Select department</option>';
        departments.forEach(d => {
          const opt = document.createElement("option");
          opt.value = d.department_code || String(d.department_id);
          opt.textContent = `${d.department_code} - ${d.department_name}`;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="">Select department</option>';
      }
    }

    async function loadEmployeeDesignationOptions() {
      const deptSelect = document.querySelector('[data-employee-field="department_id"]');
      const desigSelect = document.querySelector('[data-employee-field="designation_id"]');
      if (!deptSelect || !desigSelect) return;
      const updateDesignations = async () => {
        const deptCode = deptSelect.value;
        if (!deptCode) {
          desigSelect.innerHTML = '<option value="">Select department first</option>';
          return;
        }
        try {
          const api = window.IndipetHRMS?.api;
          const mode = window.IndipetHRMS?.dataMode;
          let designations = [];
          if (mode === "api" && api) {
            designations = await api.designations.list();
          }
          if (designations.length === 0) {
            designations = pageConfig["designation-master"].rows.map(r => ({
              designation_code: r[0],
              designation_name: r[1],
              designation_id: r[0]
            }));
          }
          const filtered = designations.filter(d =>
            d.department_code === deptCode || String(d.department_id) === deptCode
          );
          desigSelect.innerHTML = '<option value="">Select designation</option>';
          (filtered.length ? filtered : designations).forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.designation_code || String(d.designation_id);
            opt.textContent = `${d.designation_code} - ${d.designation_name}`;
            desigSelect.appendChild(opt);
          });
        } catch {
          desigSelect.innerHTML = '<option value="">Select designation</option>';
        }
      };
      deptSelect.removeEventListener("change", updateDesignations);
      deptSelect.addEventListener("change", updateDesignations);
      await updateDesignations();
    }

    async function loadEmployeeReportingManagers() {
      const entitySelect = document.querySelector('[data-employee-field="parent_entity_id"]');
      const rmSelect = document.querySelector('[data-employee-field="reporting_manager_id"]');
      if (!entitySelect || !rmSelect) return;
      const updateRM = async () => {
        const entityCode = entitySelect.value;
        if (!entityCode) {
          rmSelect.innerHTML = '<option value="">No reporting manager selected</option>';
          return;
        }
        try {
          const entityId = entitySelect.selectedOptions[0]?.dataset?.entityId || entityCode;
          const response = await fetch(`/api/parent-entities/${entityId}/employees`);
          if (!response.ok) {
            rmSelect.innerHTML = '<option value="">No reporting manager selected</option>';
            return;
          }
          const employees = await response.json();
          rmSelect.innerHTML = '<option value="">No reporting manager selected</option>';
          employees.forEach(emp => {
            const opt = document.createElement("option");
            opt.value = emp.employee_code || String(emp.employee_id);
            opt.textContent = `${emp.employee_code} - ${emp.first_name} ${emp.last_name}`;
            rmSelect.appendChild(opt);
          });
        } catch {
          rmSelect.innerHTML = '<option value="">No reporting manager selected</option>';
        }
      };
      entitySelect.removeEventListener("change", updateRM);
      entitySelect.addEventListener("change", updateRM);
      await updateRM();
    }

    async function loadLeaveDropdownOptions() {
      // Populate leave type dropdowns
      const leaveTypeSelectors = [
        "#leaveRequestType",
        "#leaveRequestTypeFilter",
        "#variantPolicy",
        "#assignmentPolicy"
      ];
      leaveTypeSelectors.forEach(id => {
        const sel = document.querySelector(id);
        if (!sel) return;
        const rows = pageConfig["leave-type-master"].rows;
        sel.innerHTML = '<option value="">Select leave type</option>';
        rows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[0];
          opt.textContent = `${r[0]} - ${r[1]}`;
          sel.appendChild(opt);
        });
      });

      // Populate employee dropdown for leave request
      const empSelect = document.querySelector("#leaveRequestEmployee");
      if (empSelect) {
        const empRows = pageConfig["employee-master"].rows;
        empSelect.innerHTML = '<option value="">Select employee</option>';
        empRows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[0];
          opt.textContent = `${r[0]} - ${r[1]}`;
          empSelect.appendChild(opt);
        });
      }

      // Populate policy dropdowns
      const policySelectors = ["#variantPolicy", "#assignmentPolicy"];
      policySelectors.forEach(id => {
        const sel = document.querySelector(id);
        if (!sel) return;
        const rows = pageConfig["leave-policy"].rows;
        sel.innerHTML = '<option value="">Select policy</option>';
        rows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[0];
          opt.textContent = `${r[0]} - ${r[1]}`;
          sel.appendChild(opt);
        });
      });

      // Populate variant dropdown for assignment
      const variantSel = document.querySelector("#assignmentVariant");
      if (variantSel) {
        const rows = pageConfig["policy-variants"].rows;
        variantSel.innerHTML = '<option value="">Select variant</option>';
        rows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[0];
          opt.textContent = `${r[0]} - ${r[1]}`;
          variantSel.appendChild(opt);
        });
      }

      // Populate location dropdown for assignment and holiday
      const locSelectors = ["#assignmentLocation", "#holidayLocation"];
      locSelectors.forEach(id => {
        const sel = document.querySelector(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">All locations</option>';
        subLocations.forEach(l => {
          const opt = document.createElement("option");
          opt.value = l.dbId || l.id;
          opt.textContent = `${l.id} - ${l.listName || l.name}`;
          sel.appendChild(opt);
        });
      });
    }

    async function onPincodeChange(pincode) {
      const citySelect = document.getElementById("locationCity");
      const stateSelect = document.getElementById("locationState");
      const stateCodeInput = document.getElementById("locationStateCode");
      if (!citySelect || !stateSelect) return;

      if (!/^\d{6}$/.test(pincode)) return;

      try {
        const response = await fetch(`/api/pincode/${pincode}`);
        if (!response.ok) return;
        const data = await response.json();

        citySelect.innerHTML = '<option value="">Select city</option>';
        (data.cities || []).forEach(city => {
          const opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          citySelect.appendChild(opt);
        });

        if (data.state && stateSelect) {
          const options = stateSelect.options;
          for (let i = 0; i < options.length; i++) {
            if (options[i].value.toLowerCase() === data.state.toLowerCase()) {
              stateSelect.value = options[i].value;
              if (stateCodeInput) stateCodeInput.value = options[i].dataset.code || data.state_code || "";
              break;
            }
          }
        }
      } catch {
        // silently fail
      }
    }

    function setupLocationFormEvents() {
      const pincodeInput = document.getElementById("locationPincode");
      if (pincodeInput) {
        pincodeInput.addEventListener("blur", () => onPincodeChange(pincodeInput.value.trim()));
        pincodeInput.addEventListener("input", () => {
          if (pincodeInput.value.trim().length === 6) onPincodeChange(pincodeInput.value.trim());
        });
      }

      const parentEntitySelect = document.getElementById("locationParentEntity");
      if (parentEntitySelect) {
        parentEntitySelect.addEventListener("change", () => {
          const selectedOption = parentEntitySelect.options[parentEntitySelect.selectedIndex];
          const entityId = selectedOption?.dataset?.entityId || "";
          loadEmployeesByEntity(entityId);
        });
      }

      const stateSelect = document.getElementById("locationState");
      const stateCodeInput = document.getElementById("locationStateCode");
      if (stateSelect && stateCodeInput) {
        stateSelect.addEventListener("change", () => {
          const selectedOption = stateSelect.options[stateSelect.selectedIndex];
          stateCodeInput.value = selectedOption?.dataset?.code || "";
        });
      }
    }

    function emptyDepartmentRecord() {
      return {
        department_name: "",
        department_short_code: "",
        department_code: "",
        revenue_centre_code: "",
        is_revenue_generating: "false",
        status: "active"
      };
    }

    function collectDepartmentFormRecord() {
      return $$("[data-department-field]").reduce((record, field) => {
        record[field.dataset.departmentField] = field.value.trim();
        return record;
      }, {});
    }

    function populateDepartmentForm(record) {
      clearDepartmentFormError();
      $$("[data-department-field]").forEach(field => {
        field.value = record[field.dataset.departmentField] ?? "";
      });
    }

    function clearDepartmentFormError() {
      const err = $("#departmentFormError");
      if (err) err.classList.remove("is-visible");
      $$("[data-department-field]").forEach(f => f.removeAttribute("aria-invalid"));
    }

    function showDepartmentFormError(message) {
      let err = $("#departmentFormError");
      if (!err) {
        err = document.createElement("div");
        err.id = "departmentFormError";
        err.className = "form-error is-visible";
        err.innerHTML = `<i data-lucide="circle-alert"></i><span id="departmentFormErrorText"></span>`;
        $("#departmentForm").prepend(err);
      }
      $("#departmentFormErrorText").textContent = message;
      err.classList.add("is-visible");
      refreshIcons();
    }

    function validateDepartmentRecord(record) {
      const required = $$("[data-department-field][required]");
      const missing = required.filter(f => !record[f.dataset.departmentField]);
      if (missing.length) {
        return { valid: false, message: "Please fill in all required fields." };
      }
      if (!/^[A-Za-z0-9]{2,10}$/.test(record.department_short_code)) {
        return { valid: false, message: "Short code must be 2-10 alphanumeric characters." };
      }
      return { valid: true, message: "" };
    }

    function openDepartmentForm(mode, record) {
      departmentFormMode = mode || "create";
      const isEdit = mode === "edit" && record;
      editingDepartmentId = isEdit ? record.department_id : null;
      activePage = "department-master-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      const target = $('.nav-child[data-page="department-master"]');
      if (target) target.classList.add("is-active");
      $$("#moduleView, #entityFormView, #employeeFormView, #locationFormView, #locationControlView, #dashboardView").forEach(v => v.classList.remove("is-active"));
      $("#departmentFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Organization", "Department Master", isEdit ? "Edit Department" : "Add New Department"]);
      $("#pageTitle").textContent = isEdit ? "Edit Department" : "Add New Department";
      $("#pageDescription").textContent = "Define a functional department used by employees, services and reporting.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Department Master`;
      const base = isEdit ? { ...emptyDepartmentRecord(), ...record } : emptyDepartmentRecord();
      populateDepartmentForm(base);
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function mapDbRowToDepartmentRow(dbRow) {
      return [
        dbRow.department_code || "",
        dbRow.department_name || "",
        dbRow.department_short_code || "",
        dbRow.revenue_centre_code || "",
        dbRow.is_revenue_generating ? "Yes" : "No",
        dbRow.status || ""
      ];
    }

    function emptyDesignationRecord() {
      return {
        designation_name: "",
        department_id: "",
        designation_code: "",
        grade_code: "",
        override_grade_code: "",
        is_keyholder_eligible: "false",
        is_salesperson_eligible: "false",
        status: "active"
      };
    }

    function collectDesignationFormRecord() {
      return $$("[data-designation-field]").reduce((record, field) => {
        record[field.dataset.designationField] = field.value.trim();
        return record;
      }, {});
    }

    function populateDesignationForm(record) {
      clearDesignationFormError();
      $$("[data-designation-field]").forEach(field => {
        field.value = record[field.dataset.designationField] ?? "";
      });
    }

    function clearDesignationFormError() {
      const err = $("#designationFormError");
      if (err) err.classList.remove("is-visible");
      $$("[data-designation-field]").forEach(f => f.removeAttribute("aria-invalid"));
    }

    function showDesignationFormError(message) {
      let err = $("#designationFormError");
      if (!err) {
        err = document.createElement("div");
        err.id = "designationFormError";
        err.className = "form-error is-visible";
        err.innerHTML = `<i data-lucide="circle-alert"></i><span id="designationFormErrorText"></span>`;
        $("#designationForm").prepend(err);
      }
      $("#designationFormErrorText").textContent = message;
      err.classList.add("is-visible");
      refreshIcons();
    }

    function validateDesignationRecord(record) {
      const required = $$("[data-designation-field][required]");
      const missing = required.filter(f => !record[f.dataset.designationField]);
      if (missing.length) {
        return { valid: false, message: "Please fill in all required fields." };
      }
      return { valid: true, message: "" };
    }

    function openDesignationForm(mode, record) {
      designationFormMode = mode || "create";
      const isEdit = mode === "edit" && record;
      editingDesignationId = isEdit ? record.designation_id : null;
      activePage = "designation-master-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      const target = $('.nav-child[data-page="designation-master"]');
      if (target) target.classList.add("is-active");
      $$("#moduleView, #entityFormView, #employeeFormView, #locationFormView, #locationControlView, #dashboardView, #departmentFormView").forEach(v => v.classList.remove("is-active"));
      $("#designationFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Organization", "Designation Master", isEdit ? "Edit Designation" : "Add New Designation"]);
      $("#pageTitle").textContent = isEdit ? "Edit Designation" : "Add New Designation";
      $("#pageDescription").textContent = "Define a job title linked to a department with grade authority and eligibility settings.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Designation Master`;
      const base = isEdit ? { ...emptyDesignationRecord(), ...record } : emptyDesignationRecord();
      populateDesignationForm(base);
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function mapDbRowToDesignationRow(dbRow) {
      return [
        dbRow.designation_code || "",
        dbRow.designation_name || "",
        dbRow.department_name || "",
        dbRow.grade_code || "",
        dbRow.is_keyholder_eligible ? "Yes" : "No",
        dbRow.status || ""
      ];
    }

    const ROLE_PERMISSION_MODULES = [
      ["Employee Management", ["Employee Master", "Employee Finance", "Employee Skills"]],
      ["Leave & Attendance", ["Leave Applications", "Attendance Correction", "CO Ledger"]],
      ["Shift & Roster", ["Shift Policy", "Roster", "Roster History"]],
      ["Payroll & Compliance", ["Salary Structure", "Payroll Run", "PT / Minimum Wage"]],
      ["Exit & Audit", ["Exit Workflow", "FnF Settlement", "Audit Log"]],
      ["Organization Setup", ["State Master", "Parent Entity", "Sub Location"]]
    ];
    const ROLE_PERMISSION_LABELS = ["View", "Create", "Edit", "Delete", "Approve", "Export"];

    function clearRoleFormError() {
      const err = $("#roleFormError");
      if (err) err.classList.remove("is-visible");
      $$("[data-role-field]").forEach(f => f.removeAttribute("aria-invalid"));
    }

    function showRoleFormError(message) {
      let err = $("#roleFormError");
      if (!err) {
        err = document.createElement("div");
        err.id = "roleFormError";
        err.className = "form-error is-visible";
        err.innerHTML = `<i data-lucide="circle-alert"></i><span id="roleFormErrorText"></span>`;
        $("#roleForm").prepend(err);
      }
      $("#roleFormErrorText").textContent = message;
      err.classList.add("is-visible");
      refreshIcons();
    }

    function emptyRoleRecord() {
      return {
        role_name: "",
        role_code: "",
        status: "Active"
      };
    }

    function collectRoleFormRecord() {
      const record = $$("[data-role-field]").reduce((r, field) => {
        r[field.dataset.roleField] = field.value.trim();
        return r;
      }, {});
      record.permissions = collectRolePermissions();
      return record;
    }

    function collectRolePermissions() {
      const result = {};
      document.querySelectorAll("#rolePermissionGrid input[type='checkbox']").forEach(input => {
        if (!input.dataset.module || !input.dataset.submodule || !input.dataset.perm) return;
        const m = input.dataset.module;
        const s = input.dataset.submodule;
        const p = input.dataset.perm;
        result[m] ||= {};
        result[m][s] ||= {};
        result[m][s][p] = input.checked;
      });
      return result;
    }

    function populateRoleForm(record) {
      clearRoleFormError();
      $$("[data-role-field]").forEach(field => {
        field.value = record[field.dataset.roleField] ?? "";
      });
    }

    function validateRoleRecord(record) {
      const required = $$("[data-role-field][required]");
      const missing = required.filter(f => !record[f.dataset.roleField]);
      if (missing.length) {
        return { valid: false, message: "Please fill in all required fields." };
      }
      return { valid: true, message: "" };
    }

    function buildRolePermissionGrid(permissions) {
      const grid = $("#rolePermissionGrid");
      if (!grid) return;
      grid.innerHTML = "";
      ROLE_PERMISSION_MODULES.forEach(([moduleName, submodules]) => {
        const wrapper = document.createElement("div");
        wrapper.className = "role-module-row";
        const head = document.createElement("div");
        head.className = "role-module-head";
        head.innerHTML = `<div class="role-module-name">${moduleName}</div>${ROLE_PERMISSION_LABELS.map(p => `<div class="role-perm-label">${p}</div>`).join("")}`;
        wrapper.appendChild(head);
        submodules.forEach(submodule => {
          const row = document.createElement("div");
          row.className = "role-module-perms";
          const cells = ROLE_PERMISSION_LABELS.map(permission => {
            const checked = permissions &&
              permissions[moduleName] &&
              permissions[moduleName][submodule] &&
              permissions[moduleName][submodule][permission] === true;
            const danger = permission === "Delete" ? " role-toggle-danger" : "";
            return `<label class="role-toggle${danger}">
              <input type="checkbox" data-module="${moduleName}" data-submodule="${submodule}" data-perm="${permission}" ${checked ? "checked" : ""}>
              <span class="role-toggle-box">&#10003;</span>
            </label>`;
          }).join("");
          row.innerHTML = `<div class="role-submodule-name">${submodule}</div>${cells}`;
          wrapper.appendChild(row);
        });
        grid.appendChild(wrapper);
      });
      updateRoleJsonPreview();
    }

    function updateRoleJsonPreview() {
      const preview = $("#roleJsonPreview");
      if (!preview) return;
      const permissions = collectRolePermissions();
      preview.value = JSON.stringify(permissions, null, 2);
    }

    function openRoleForm(mode, record) {
      roleFormMode = mode || "create";
      const isEdit = mode === "edit" && record;
      editingRoleId = isEdit ? record.role_id : null;
      activePage = "role-manager-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      const target = $('.nav-child[data-page="role-manager"]');
      if (target) target.classList.add("is-active");
      $$("#moduleView, #entityFormView, #employeeFormView, #locationFormView, #locationControlView, #dashboardView, #departmentFormView, #designationFormView").forEach(v => v.classList.remove("is-active"));
      $("#roleFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Organization", "Role Master", isEdit ? "Edit Role" : "Add New Role"]);
      $("#pageTitle").textContent = isEdit ? "Edit Role" : "Add New Role";
      $("#pageDescription").textContent = "Configure ERP access by selecting permissions through controls. The system will generate the JSON internally.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Role Master`;
      const base = isEdit ? { ...emptyRoleRecord(), ...record } : emptyRoleRecord();
      populateRoleForm(base);
      buildRolePermissionGrid(isEdit ? (record.permissions || null) : null);
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openLeaveTypeForm(record) {
      const isEdit = !!record;
      leaveTypeFormMode = isEdit ? "edit" : "create";
      editingLeaveTypeId = isEdit ? record.leave_type_id : null;
      activePage = "leave-type-master-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="leave-type-master"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView").forEach(v => v.classList.remove("is-active"));
      $("#leaveTypeFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Leave Type Master", isEdit ? "Edit Leave Type" : "Add Leave Type"]);
      $("#pageTitle").textContent = isEdit ? "Edit Leave Type" : "Add Leave Type";
      $("#pageDescription").textContent = "Create a new leave type definition.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Leave Type Master`;
      $$("[data-leave-type-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.leaveTypeField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openLeavePolicyForm(record) {
      const isEdit = !!record;
      leavePolicyFormMode = isEdit ? "edit" : "create";
      editingLeavePolicyId = isEdit ? record.policy_id : null;
      activePage = "leave-policy-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="leave-policy"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView").forEach(v => v.classList.remove("is-active"));
      $("#leavePolicyFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Leave Policy", isEdit ? "Edit Policy" : "Create Policy"]);
      $("#pageTitle").textContent = isEdit ? "Edit Leave Policy" : "Create Leave Policy";
      $("#pageDescription").textContent = "Configure a financial-year leave policy wrapper.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Leave Policy`;
      $$("[data-leave-policy-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.leavePolicyField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openPolicyVariantForm() {
      activePage = "policy-variants-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="policy-variants"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView").forEach(v => v.classList.remove("is-active"));
      $("#policyVariantFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Policy Variants", "Add Variant"]);
      $("#pageTitle").textContent = "Add Policy Variant";
      $("#pageDescription").textContent = "Define entitlement behaviour for a specific group.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Policy Variants`;
      loadLeaveDropdownOptions();
      $("#policyVariantForm").reset();
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openPolicyAssignmentForm() {
      activePage = "policy-assignments-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="policy-assignments"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #holidayCalendarFormView, #leaveRequestFormView").forEach(v => v.classList.remove("is-active"));
      $("#policyAssignmentFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Policy Assignments", "Add Assignment"]);
      $("#pageTitle").textContent = "Add Policy Assignment";
      $("#pageDescription").textContent = "Assign a policy variant to a group or employee.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Policy Assignments`;
      loadLeaveDropdownOptions();
      $("#policyAssignmentForm").reset();
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openHolidayCalendarForm() {
      activePage = "holiday-calendar-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="holiday-calendar"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #leaveRequestFormView").forEach(v => v.classList.remove("is-active"));
      $("#holidayCalendarFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Holiday Calendar", "Add Holiday"]);
      $("#pageTitle").textContent = "Add Holiday";
      $("#pageDescription").textContent = "Add a holiday to the calendar.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Holiday Calendar`;
      loadLeaveDropdownOptions();
      $("#holidayCalendarForm").reset();
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openLeaveRequestForm(record) {
      const isEdit = !!record;
      leaveRequestFormMode = isEdit ? "edit" : "create";
      editingLeaveRequestId = isEdit ? record.request_id : null;
      activePage = "leave-requests-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="leave-requests"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView").forEach(v => v.classList.remove("is-active"));
      $("#leaveRequestFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Leave Management", "Leave Requests", isEdit ? "Edit Request" : "New Request"]);
      $("#pageTitle").textContent = isEdit ? "Edit Leave Request" : "New Leave Request";
      $("#pageDescription").textContent = "Submit a leave request for an employee.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Leave Requests`;
      loadLeaveDropdownOptions();
      $$("[data-leave-request-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.leaveRequestField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openAttendanceForm(record) {
      const isEdit = !!record;
      attendanceFormMode = isEdit ? "edit" : "create";
      editingAttendanceId = isEdit ? record.id : null;
      activePage = "attendance-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="attendance-list"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView, #regularizationFormView, #shiftExceptionFormView, #coLedgerFormView, #attendanceReportFormView").forEach(v => v.classList.remove("is-active"));
      $("#attendanceFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Attendance", "Attendance List", isEdit ? "Edit Attendance" : "Add Attendance"]);
      $("#pageTitle").textContent = isEdit ? "Edit Attendance Record" : "Add Attendance Record";
      $("#pageDescription").textContent = "Record an employee's attendance for a specific date.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Attendance List`;
      populateEmployeeDropdown($("#attendanceEmployee"));
      populateLocationDropdown($("#attendanceLocation"));
      populateShiftDropdown($("#attendanceShift"));
      $$("[data-attendance-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.attendanceField] ?? "") : "";
      });
      if (!isEdit) {
        const today = new Date().toISOString().slice(0, 10);
        if ($("#attendanceForm [data-attendance-field='attendance_date']")) $("#attendanceForm [data-attendance-field='attendance_date']").value = today;
      }
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openRegularizationForm(record) {
      const isEdit = !!record;
      regularizationFormMode = isEdit ? "edit" : "create";
      editingRegularizationId = isEdit ? record.request_id : null;
      activePage = "regularization-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="regularization"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView, #attendanceFormView, #shiftExceptionFormView, #coLedgerFormView, #attendanceReportFormView").forEach(v => v.classList.remove("is-active"));
      $("#regularizationFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Attendance", "Regularization", isEdit ? "Edit Request" : "New Request"]);
      $("#pageTitle").textContent = isEdit ? "Edit Regularization Request" : "New Regularization Request";
      $("#pageDescription").textContent = "Submit a request to correct an attendance record.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Regularization`;
      populateEmployeeDropdown($("#regEmployee"));
      $$("[data-reg-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.regField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openShiftExceptionForm(record) {
      const isEdit = !!record;
      shiftExceptionFormMode = isEdit ? "edit" : "create";
      editingShiftExceptionId = isEdit ? record.exception_id : null;
      activePage = "shift-exceptions-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="shift-exceptions"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView, #attendanceFormView, #regularizationFormView, #coLedgerFormView, #attendanceReportFormView").forEach(v => v.classList.remove("is-active"));
      $("#shiftExceptionFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Attendance", "Shift Exceptions", isEdit ? "Edit Exception" : "Review Exception"]);
      $("#pageTitle").textContent = isEdit ? "Edit Shift Exception" : "Review Shift Exception";
      $("#pageDescription").textContent = "Log a shift exception for monitoring and resolution.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Shift Exceptions`;
      populateEmployeeDropdown($("#excEmployee"));
      populateShiftDropdown($("#excShift"));
      $$("[data-exc-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.excField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openCoLedgerForm(record) {
      const isEdit = !!record;
      coLedgerFormMode = isEdit ? "edit" : "create";
      editingCoLedgerId = isEdit ? record.entry_id : null;
      activePage = "co-ledger-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="co-ledger"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView, #attendanceFormView, #regularizationFormView, #shiftExceptionFormView, #attendanceReportFormView").forEach(v => v.classList.remove("is-active"));
      $("#coLedgerFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Attendance", "CO Ledger", isEdit ? "Edit Entry" : "Manual Credit"]);
      $("#pageTitle").textContent = isEdit ? "Edit CO Entry" : "Manual CO Credit";
      $("#pageDescription").textContent = "Credit or adjust compensatory-off units for an employee.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to CO Ledger`;
      populateEmployeeDropdown($("#coEmployee"));
      $$("[data-co-field]").forEach(f => {
        f.value = isEdit ? (record[f.dataset.coField] ?? "") : "";
      });
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function openAttendanceReportForm() {
      activePage = "attendance-reports-form";
      $$(".nav-single, .nav-child").forEach(b => b.classList.remove("is-active"));
      $('.nav-child[data-page="attendance-reports"]')?.classList.add("is-active");
      $$("#dashboardView, #locationControlView, #locationFormView, #entityFormView, #employeeFormView, #moduleView, #departmentFormView, #designationFormView, #roleFormView, #leaveTypeFormView, #leavePolicyFormView, #policyVariantFormView, #policyAssignmentFormView, #holidayCalendarFormView, #leaveRequestFormView, #attendanceFormView, #regularizationFormView, #shiftExceptionFormView, #coLedgerFormView").forEach(v => v.classList.remove("is-active"));
      $("#attendanceReportFormView").classList.add("is-active");
      setBreadcrumb(["HRMS", "Attendance", "Attendance Reports", "Generate Report"]);
      $("#pageTitle").textContent = "Generate Report";
      $("#pageDescription").textContent = "Create a new attendance report with configurable scope and period.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Attendance Reports`;
      $("#attendanceReportForm").reset();
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function populateEmployeeDropdown(select, locationId) {
      if (!select) return;
      select.innerHTML = `<option value="">Select employee</option>`;
      const data = employeeMasterData.length ? employeeMasterData : pageConfig["employee-master"]?.rows || [];
      const filtered = locationId ? data.filter(e => Number(e.location_id) === Number(locationId)) : data;
      filtered.forEach(e => {
        const opt = document.createElement("option");
        const empId = e.employee_id || "";
        const empName = e.first_name ? `${e.first_name} ${e.last_name || ""}`.trim() : (Array.isArray(e) ? e[1] || e[0] || "" : "");
        opt.value = empId;
        opt.textContent = empName;
        select.appendChild(opt);
      });
    }

    function populateLocationDropdown(select) {
      if (!select) return;
      select.innerHTML = `<option value="">Select location</option>`;
      subLocations.forEach(loc => {
        const opt = document.createElement("option");
        opt.value = loc.dbId != null ? loc.dbId : loc.id;
        opt.textContent = loc.listName;
        select.appendChild(opt);
      });
    }

    function populateShiftDropdown(select) {
      if (!select) return;
      select.innerHTML = `<option value="">Select shift</option>`;
      const seen = new Set();
      (subLocations || []).forEach(loc => {
        (loc.shifts || []).forEach(s => {
          const id = String(s[0]);
          if (!seen.has(id)) {
            seen.add(id);
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = s[1] || s[0];
            select.appendChild(opt);
          }
        });
      });
    }

    function mapDbRowToRoleRow(dbRow) {
      const permCount = dbRow.permissions
        ? Object.values(dbRow.permissions).reduce((sum, subs) => {
            return sum + Object.values(subs).reduce((s, perms) => s + Object.keys(perms).length, 0);
          }, 0)
        : 0;
      return [
        dbRow.role_code || "",
        dbRow.role_name || "",
        dbRow.status || "",
        String(permCount)
      ];
    }

    function mapDbRowToLeaveTypeRow(dbRow) {
      return [
        dbRow.leave_code || "",
        dbRow.leave_name || "",
        dbRow.is_paid ? "Yes" : "No",
        dbRow.accrual_type || "none",
        dbRow.status || "active"
      ];
    }

    function mapDbRowToLeavePolicyRow(dbRow) {
      return [
        dbRow.policy_code || "",
        dbRow.policy_name || "",
        String(dbRow.policy_year || ""),
        String(dbRow.version_number || 1),
        dbRow.status || "active"
      ];
    }

    function mapDbRowToPolicyVariantRow(dbRow) {
      const entitlements = dbRow.leave_entitlements || {};
      const count = Object.keys(entitlements).length;
      return [
        dbRow.variant_code || "",
        dbRow.variant_name || "",
        dbRow.applicable_to || "all",
        String(count),
        dbRow.status || "active"
      ];
    }

    function mapDbRowToPolicyAssignmentRow(dbRow) {
      return [
        String(dbRow.assignment_id || ""),
        dbRow.assignment_level || "",
        dbRow.variant_name || dbRow.variant_code || "",
        dbRow.target_location_id ? `Loc ${dbRow.target_location_id}` : "All",
        dbRow.status || "active"
      ];
    }

    function mapDbRowToHolidayRow(dbRow) {
      const date = dbRow.holiday_date ? new Date(dbRow.holiday_date).toISOString().slice(0, 10) : "";
      return [
        date,
        dbRow.holiday_name || "",
        dbRow.state_code || "WB",
        dbRow.is_closed ? "Closed" : "Open",
        dbRow.co_eligible ? "Yes" : "No"
      ];
    }

    function mapDbRowToLeaveRequestRow(dbRow) {
      const empName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      const startDate = dbRow.start_date ? new Date(dbRow.start_date).toISOString().slice(0, 10) : "";
      const endDate = dbRow.end_date ? new Date(dbRow.end_date).toISOString().slice(0, 10) : "";
      return [
        `LR-${dbRow.request_id}`,
        empName || `Emp ${dbRow.employee_id}`,
        dbRow.leave_code || "",
        `${startDate} to ${endDate}`,
        dbRow.status || "pending"
      ];
    }

    function mapDbRowToAttendanceRow(dbRow) {
      const empName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      return [
        empName || `Emp ${dbRow.employee_id}`,
        dbRow.location_name || `Location ${dbRow.location_id}`,
        dbRow.shift_name || "-",
        dbRow.total_hours ? `${dbRow.total_hours}h` : "-",
        dbRow.status || "Present",
      ];
    }

    function mapDbRowToRegularizationRow(dbRow) {
      const empName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      return [
        `RR-${dbRow.request_id}`,
        empName || `Emp ${dbRow.employee_id}`,
        (dbRow.issue_type || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        dbRow.attendance_date ? new Date(dbRow.attendance_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        dbRow.status || "Pending",
      ];
    }

    function mapDbRowToShiftExceptionRow(dbRow) {
      const empName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      return [
        empName || `Emp ${dbRow.employee_id}`,
        (dbRow.exception_type || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        dbRow.shift_name || "-",
        dbRow.exception_date ? new Date(dbRow.exception_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        dbRow.severity || "Open",
      ];
    }

    function mapDbRowToCoLedgerRow(dbRow) {
      const empName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      const entryLabel = (dbRow.entry_type || "").replace(/\b\w/g, c => c.toUpperCase());
      return [
        empName || `Emp ${dbRow.employee_id}`,
        entryLabel,
        `${dbRow.units}`,
        dbRow.expiry_date ? new Date(dbRow.expiry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
        dbRow.balance_after > 0 ? "Available" : "Expired",
      ];
    }

    function mapDbRowToAttendanceReportRow(dbRow) {
      return [
        dbRow.report_name || "Untitled Report",
        dbRow.scope || "All",
        dbRow.period_start && dbRow.period_end
          ? `${new Date(dbRow.period_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} - ${new Date(dbRow.period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
          : "Custom",
        `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim() || "System",
        dbRow.last_run_at ? "Run" : "Draft",
      ];
    }

    function validateLocationRecord(record) {
      const requiredFields = $$("[data-location-field][required]");
      const missing = requiredFields.filter(field => !record[field.dataset.locationField]);
      if (missing.length) {
        return {
          valid: false,
          message: "Complete all required location fields before saving.",
          fields: missing
        };
      }

      const emailField = $('[data-location-field="email"]');
      if (record.email && !emailField.validity.valid) {
        return {
          valid: false,
          message: "Enter a valid email address.",
          fields: [emailField]
        };
      }

      const duplicate = subLocations.find(location =>
        location.id.toLowerCase() === (record.location_code || "").toLowerCase()
        && location.id !== editingLocationId
      );
      if (duplicate) {
        return {
          valid: false,
          message: `Location code ${record.location_code} already exists.`,
          fields: [$('[data-location-field="location_code"]')]
        };
      }

      // validate shift policies
      const policies = record.shift_policies || [];
      if (policies.length === 0) {
        return {
          valid: false,
          message: "At least one shift policy is required.",
          fields: []
        };
      }
      for (const p of policies) {
        if (!p.policy_name) {
          return {
            valid: false,
            message: "Each shift policy must have a name.",
            fields: []
          };
        }
        if (!p.shift_start_time || !p.shift_end_time) {
          return {
            valid: false,
            message: `Set start and end times for "${p.policy_name}".`,
            fields: []
          };
        }
      }

      return { valid: true, message: "", fields: [] };
    }

    function emptyEntityRecord() {
      return {
        entity_id: "",
        legal_name: "",
        entity_type: "",
        entity_role: "",
        gstin: "",
        gst_type: "",
        pan_number: "",
        cin_number: "",
        phone: "",
        email: "",
        address_line1: "",
        address_line2: "",
        city: "",
        pincode: "",
        state: "",
        country: "India",
        commission_on_products: "0",
        commission_on_services: "0",
        status: "Active"
      };
    }

    function generateEntityId(record) {
      const prefix = record.entity_role === "HQ" ? "IPL" : record.entity_type === "Partnership" ? "PCP" : record.entity_type === "Proprietorship" ? "SCP" : "HPR";
      const existingNumbers = pageConfig["entity-master"].rows
        .map(row => Number(String(row[0]).replace(/\D/g, "")))
        .filter(Number.isFinite);
      const next = Math.max(100, ...existingNumbers) + 1;
      return `${prefix}${next}`;
    }

    function populateEntityForm(record = emptyEntityRecord()) {
      clearEntityFormError();
      $$("[data-entity-field]").forEach(field => {
        field.value = record[field.dataset.entityField] ?? "";
      });
      populateEntityRoleMasterOptions();
      resetEntityAccessFields();
      updateEntityAccessState();
      renderEntityLinkedLocations();
      setEntityStep(0);
    }

    function populateEntityRoleMasterOptions() {
      const source = $('[data-employee-field="role_id"]');
      const target = $('[data-entity-access-field="role_id"]');
      if (!source || !target) return;

      const options = Array.from(source.options)
        .filter(option => option.value)
        .map(option => ({ value: option.value, label: option.textContent.trim() }));

      target.replaceChildren(new Option("Select role from Role Master", ""));
      options.forEach(option => target.add(new Option(option.label, option.value)));
    }

    function entityLoginAccessRequired() {
      const entityRole = $('[data-entity-field="entity_role"]').value;
      return entityRole === "Franchisee" || entityRole === "Branch";
    }

    function resetEntityAccessFields() {
      $$("[data-entity-access-field]").forEach(field => {
        field.value = field.dataset.entityAccessField === "login_status" ? "Active" : "";
        field.removeAttribute("aria-invalid");
      });
    }

    function updateEntityAccessState() {
      const entityRole = $('[data-entity-field="entity_role"]').value;
      const accessRequired = entityLoginAccessRequired();
      const fieldset = $("#entityAccessFieldset");
      const context = $("#entityAccessContext");
      const contextTitle = $("#entityAccessContextTitle");
      const contextCopy = $("#entityAccessContextCopy");

      fieldset.disabled = !accessRequired;
      context.classList.toggle("is-disabled", !accessRequired);

      $$(".entity-access-field-state").forEach(state => {
        state.textContent = accessRequired ? "Required" : "Not required";
        state.classList.toggle("required", accessRequired);
      });

      $$("[data-entity-access-field]").forEach(field => {
        field.required = accessRequired;
        if (!accessRequired) field.removeAttribute("aria-invalid");
      });

      if (accessRequired) {
        contextTitle.textContent = `ERP access required for ${entityRole}`;
        contextCopy.textContent = "Complete the login fields below. Access permissions come from the selected Role Master record.";
      } else if (entityRole) {
        contextTitle.textContent = `ERP login access is not required for ${entityRole}`;
        contextCopy.textContent = "This step remains part of the workflow, but its fields are disabled for the selected entity role.";
        resetEntityAccessFields();
      } else {
        contextTitle.textContent = "Select an entity role in Overview";
        contextCopy.textContent = "Login fields become available when the entity role is Franchisee or Branch.";
        resetEntityAccessFields();
      }

      refreshIcons();
    }

    function collectEntityFormRecord() {
      return $$("[data-entity-field]").reduce((record, field) => {
        record[field.dataset.entityField] = field.value.trim();
        return record;
      }, emptyEntityRecord());
    }

    function renderEntityLinkedLocations() {
      $("#entityLinkedLocations").innerHTML = subLocations.map(location => `
        <label class="entity-linked-option">
          <input type="checkbox" data-entity-location-link="${location.id}">
          <span>
            <span class="entity-linked-name">${location.listName}</span>
            <span class="entity-linked-meta">${location.id} · Current parent ${location.parentCode}</span>
          </span>
          <span class="badge ${statusClass[location.status] || "grey"}">${location.status}</span>
        </label>
      `).join("");
    }

    function setEntityFormHeader(mode) {
      const isEdit = mode === "edit";
      setBreadcrumb(["HRMS", "Organization", "Entity Master", isEdit ? "Edit Entity" : "Add New Entity"]);
      $("#pageTitle").textContent = isEdit ? "Edit Entity" : "Add New Entity";
      $("#pageDescription").textContent = isEdit ? "Update the legal or business entity record." : "Create a new legal or business entity that owns or operates locations.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Entity Control Center`;
    }

    function openEntityForm(record) {
      const isEdit = !!record;
      entityFormMode = isEdit ? "edit" : "create";
      editingEntityId = isEdit ? record.entity_id : null;
      activePage = "entity-master-form";
      activeEntityStep = 0;
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      const target = $('.nav-child[data-page="entity-master"]');
      target.classList.add("is-active");
      openGroup(target.closest(".nav-group"), true);
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#locationFormView").classList.remove("is-active");
      $("#employeeFormView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#moduleView").classList.remove("is-active");
      $("#entityFormView").classList.add("is-active");
      setEntityFormHeader(isEdit ? "edit" : null);
      populateEntityForm(isEdit ? { ...emptyEntityRecord(), ...record } : undefined);
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function setEntityStep(stepIndex) {
      activeEntityStep = Math.max(0, Math.min(5, stepIndex));
      $$("#entityStepper [data-entity-step]").forEach((step, index) => {
        step.classList.toggle("is-active", index === activeEntityStep);
        step.classList.toggle("is-complete", index < activeEntityStep);
      });
      $$("[data-entity-section]").forEach((section, index) => {
        section.classList.toggle("is-active", index === activeEntityStep);
      });
      $("#backEntityStep").disabled = activeEntityStep === 0;
      $("#nextEntityStep").hidden = activeEntityStep === 5;
      $("#submitEntityForm").hidden = activeEntityStep !== 5;
      clearEntityFormError();
      refreshIcons();
    }

    function clearEntityFormError() {
      $("#entityFormError").classList.remove("is-visible");
      $$("[data-entity-field], [data-entity-access-field]").forEach(field => field.removeAttribute("aria-invalid"));
    }

    function showEntityFormError(message, fields = []) {
      $("#entityFormErrorText").textContent = message;
      $("#entityFormError").classList.add("is-visible");
      fields.forEach(field => field.setAttribute("aria-invalid", "true"));
      $("#entityFormError").scrollIntoView({ behavior: "smooth", block: "center" });
      refreshIcons();
    }

    function validateEntityRecord(record) {
      const requiredFields = $$("[data-entity-field][required]");
      const missing = requiredFields.filter(field => !record[field.dataset.entityField]);
      if (missing.length) {
        return {
          valid: false,
          message: "Complete all required entity fields before creating the entity.",
          fields: missing
        };
      }

      const emailField = $('[data-entity-field="email"]');
      if (record.email && !emailField.validity.valid) {
        return {
          valid: false,
          message: "Enter a valid email address.",
          fields: [emailField]
        };
      }

      return { valid: true, message: "", fields: [] };
    }

    function validateEntityAccess() {
      if (!entityLoginAccessRequired()) return { valid: true, message: "", fields: [] };

      const accessFields = $$("[data-entity-access-field]");
      const missing = accessFields.filter(field => field.required && !field.value.trim());
      if (missing.length) {
        return {
          valid: false,
          message: "Complete all required ERP login access fields for this Franchisee or Branch entity.",
          fields: missing
        };
      }

      const password = $('[data-entity-access-field="password"]');
      const confirmation = $('[data-entity-access-field="confirm_password"]');
      if (password.value !== confirmation.value) {
        return {
          valid: false,
          message: "Password and Confirm Password must match.",
          fields: [password, confirmation]
        };
      }

      return { valid: true, message: "", fields: [] };
    }

    async function createEntityRecord(record) {
      const api = window.IndipetHRMS?.api;
      const mode = window.IndipetHRMS?.dataMode;

      if (mode === "api" && api) {
        try {
          if (editingEntityId) {
            const updated = await fetch(`/api/entities/${editingEntityId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const entityId = updated.entity_code || String(updated.entity_id);
            const idx = entityMasterData.findIndex(e => e.entity_id === editingEntityId);
            if (idx >= 0) {
              entityMasterData[idx] = updated;
              pageConfig["entity-master"].rows[idx] = [
                entityId,
                updated.legal_name,
                updated.entity_type ? updated.entity_type.charAt(0).toUpperCase() + updated.entity_type.slice(1) : "",
                updated.entity_role ? updated.entity_role.charAt(0).toUpperCase() + updated.entity_role.slice(1) : "",
                updated.status
              ];
            }
            parentEntities[entityId] = updated.legal_name;
            selectedEntityId = entityId;
            resetEntityAccessFields();
            activatePage("entity-master");
            $("#moduleSearch").value = entityId;
            renderModule("entity-master");
            showToast(`${updated.legal_name} updated.`);
            return;
          }
          const created = await api.entities.create(record);
          const entityId = created.entity_code || String(created.entity_id);
          entityMasterData.push(created);
          pageConfig["entity-master"].rows.push([
            entityId,
            created.legal_name,
            created.entity_type,
            created.entity_role,
            created.status
          ]);
          pageConfig["entity-master"].values = [
            String(pageConfig["entity-master"].rows.length),
            String(pageConfig["entity-master"].rows.filter(row => row[3] === "Franchisee").length),
            String(subLocations.length)
          ];
          parentEntities[entityId] = created.legal_name;

          selectedEntityId = entityId;
          resetEntityAccessFields();
          activatePage("entity-master");
          $("#moduleSearch").value = entityId;
          renderModule("entity-master");
          showToast(`${created.legal_name} created and selected.`);
          return;
        } catch (err) {
          showEntityFormError(err.message || "Entity creation failed via API.");
          return;
        }
      }

      const entityId = generateEntityId(record);
      const finalRecord = { ...record, entity_id: entityId };
      entityMasterData.push(finalRecord);
      pageConfig["entity-master"].rows.push([
        entityId,
        finalRecord.legal_name,
        finalRecord.entity_type,
        finalRecord.entity_role,
        finalRecord.status
      ]);
      pageConfig["entity-master"].values = [
        String(pageConfig["entity-master"].rows.length),
        String(pageConfig["entity-master"].rows.filter(row => row[3] === "Franchisee").length),
        String(subLocations.length)
      ];
      parentEntities[entityId] = finalRecord.legal_name;

      $$("[data-entity-location-link]:checked").forEach(checkbox => {
        const location = subLocations.find(item => item.id === checkbox.dataset.entityLocationLink);
        if (!location) return;
        location.parentCode = entityId;
        location.parent = finalRecord.legal_name;
        if (location.record) location.record.parent_entity_id = entityId;
      });

      selectedEntityId = entityId;
      resetEntityAccessFields();
      activatePage("entity-master");
      $("#moduleSearch").value = entityId;
      renderModule("entity-master");
      showToast(`${finalRecord.legal_name} created and selected.`);
    }

    const employeeSetupSections = [
      { name: "Employment Basics", section: 0, fields: ["first_name", "last_name", "employee_type", "employment_subtype", "date_of_joining", "status"] },
      { name: "Organization Assignment", section: 1, fields: ["parent_entity_id", "location_id", "department_id", "designation_id"] },
      { name: "Access & Attendance", section: 2, fields: ["phone", "email", "login_id", "role_id"] },
      { name: "Personal Profile", section: 3, fields: ["date_of_birth", "blood_group", "guardian_name"] },
      { name: "Address", section: 4, fields: ["present_address", "address_city", "address_state", "address_pincode"] },
      { name: "Emergency Contact", section: 5, fields: ["emergency_contact_name", "emergency_relationship", "emergency_phone"] },
      { name: "Statutory & KYC", section: 6, fields: ["aadhaar_number", "pan_number"] },
      { name: "Finance", section: 7, fields: ["bank_name", "account_number", "ifsc_code"] },
      { name: "Documents, Skills & Shift", section: 8, fields: ["document_type", "document_status", "primary_skill", "shift_preference_mode", "default_shift_id"] }
    ];

    function setEmployeeFormHeader(mode) {
      const isEdit = mode === "edit";
      setBreadcrumb(["HRMS", "Employees", "Employee Master", isEdit ? "Edit Employee" : "Add New Employee"]);
      $("#pageTitle").textContent = isEdit ? "Edit Employee" : "Add New Employee";
      $("#pageDescription").textContent = isEdit ? "Update the employee profile." : "Create one employee profile through a unified setup workflow. Related profile sections are linked internally by the system.";
      $(".page-actions").classList.add("is-form-page");
      $("#exportButton").style.display = "none";
      $("#primaryAction").className = "button";
      $("#primaryAction").innerHTML = `<i data-lucide="arrow-left"></i>Back to Employee Control Center`;
      $("#modalTitle").textContent = isEdit ? "Edit Employee" : "Add New Employee";
      $("#modalSubtitle").textContent = "Employee setup workflow";
    }

    function openEmployeeForm(record) {
      const isEdit = !!record;
      employeeFormMode = isEdit ? "edit" : "create";
      editingEmployeeId = isEdit ? record.employee_id : null;
      activePage = "employee-master-form";
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      $('.nav-single[data-page="employee-master"]').classList.add("is-active");
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#locationFormView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#moduleView").classList.remove("is-active");
      $("#employeeFormView").classList.add("is-active");
      setEmployeeFormHeader(isEdit ? "edit" : null);
      resetEmployeeForm();
      loadEntityOptions();
      loadEmployeeLocationOptions();
      loadEmployeeDepartmentOptions();
      loadEmployeeDesignationOptions();
      loadRoleOptions();
      loadEmployeeReportingManagers();
      if (isEdit) {
        $$("[data-employee-field]").forEach(f => {
          f.value = record[f.dataset.employeeField] ?? "";
        });
      }
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function resetEmployeeForm() {
      $("#employeeForm").reset();
      $('[data-employee-field="nationality"]').value = "Indian";
      $('[data-employee-field="same_as_present"]').value = "true";
      $('[data-employee-field="is_reporting_manager_eligible"]').value = "false";
      $('[data-employee-field="is_salesperson"]').value = "false";
      $('[data-employee-field="face_registered"]').value = "false";
      renderEmployeePreferredShiftOptions();
      clearEmployeeFormError();
      setEmployeeStep(0);
      updateEmployeeReadiness();
    }

    function renderEmployeePreferredShiftOptions() {
      const locationId = $('[data-employee-field="location_id"]').value;
      const preferredShift = $("#employeePreferredShift");
      if (!preferredShift) return;
      const currentValue = preferredShift.value;
      const location = subLocations.find(item => item.id === locationId);
      const activeShifts = (location?.shifts || []).filter(shift => shift[5] === "Active");
      if (!locationId) {
        preferredShift.innerHTML = `<option value="">Select assigned location first</option>`;
        preferredShift.disabled = true;
        return;
      }
      if (!activeShifts.length) {
        preferredShift.innerHTML = `<option value="">No active shifts available for this location</option>`;
        preferredShift.disabled = true;
        return;
      }
      preferredShift.disabled = false;
      preferredShift.innerHTML = [
        `<option value="">No preferred shift</option>`,
        ...activeShifts.map(shift => `<option value="${shift[0]}">${shift[1]} - ${shift[2]}</option>`)
      ].join("");
      if (activeShifts.some(shift => shift[0] === currentValue)) {
        preferredShift.value = currentValue;
      }
    }

    function collectEmployeeRecord() {
      return $$("[data-employee-field]").reduce((record, field) => {
        record[field.dataset.employeeField] = field.value.trim();
        return record;
      }, {});
    }

    function generateEmployeeId(record) {
      const code = record.location_id || "EMP";
      const parts = code.split("-");
      const prefix = parts.length >= 2 ? `${parts[0]}-${parts[1].replace(/\d+$/, "")}` : "EMP";
      const existingNumbers = pageConfig["employee-master"].rows
        .map(row => {
          const match = String(row[0]).match(/(?:EMP|CON|E)(\d+)$/);
          return match ? Number(match[1]) : NaN;
        })
        .filter(Number.isFinite);
      const next = Math.max(1526, ...existingNumbers) + 1;
      return `${prefix}-E${next}`;
    }

    function employeeFullName(record) {
      return `${record.first_name || ""} ${record.last_name || ""}`.trim() || "New Employee";
    }

    function employeeLabelFromSelect(fieldName, fallback = "") {
      const field = $(`[data-employee-field="${fieldName}"]`);
      return field?.selectedOptions?.[0]?.textContent?.trim() || fallback;
    }

    function employeeSectionComplete(record, section) {
      return section.fields.every(field => Boolean(record[field]));
    }

    function employeeReadiness(record = collectEmployeeRecord()) {
      const states = employeeSetupSections.map(section => ({ ...section, complete: employeeSectionComplete(record, section) }));
      const completed = states.filter(item => item.complete).length;
      return {
        states,
        completed,
        percent: Math.round((completed / states.length) * 100),
        status: completed === states.length ? "Ready to Activate" : completed >= 2 ? "Continue Setup" : "Incomplete Profile"
      };
    }

    function updateEmployeeReadiness() {
      const readiness = employeeReadiness();
      $("#employeeReadinessPercent").textContent = `${readiness.percent}%`;
      $("#employeeReadinessBar").style.width = `${readiness.percent}%`;
      $("#employeeReadinessStatus").textContent = readiness.status;
      $("#employeeReadinessStatus").className = `badge ${readiness.percent === 100 ? "green" : readiness.percent >= 50 ? "blue" : "amber"}`;
      $("#employeeReadinessList").innerHTML = readiness.states.map(item => `
        <div class="readiness-item ${item.complete ? "is-complete" : ""}">
          <span class="readiness-dot">${item.complete ? "✓" : "!"}</span>
          <span><strong>${item.name}</strong>${item.complete ? "Completed" : "Missing required details"}</span>
        </div>
      `).join("");
      $("#employeeReviewGrid").innerHTML = readiness.states.map(item => `
        <div class="employee-review-card">
          <strong>${item.name}</strong>
          <span>${item.complete ? "Ready" : "Needs attention before activation"}</span>
        </div>
      `).join("");
    }

    function setEmployeeStep(stepIndex) {
      activeEmployeeStep = Math.max(0, Math.min(9, stepIndex));
      $$("#employeeStepper [data-employee-step]").forEach((step, index) => {
        step.classList.toggle("is-active", index === activeEmployeeStep);
        step.classList.toggle("is-complete", index < activeEmployeeStep);
      });
      $$("[data-employee-section]").forEach((section, index) => {
        section.classList.toggle("is-active", index === activeEmployeeStep);
      });
      $("#backEmployeeStep").disabled = activeEmployeeStep === 0;
      $("#nextEmployeeStep").hidden = activeEmployeeStep === 9;
      $("#submitEmployeeForm").hidden = activeEmployeeStep !== 9;
      clearEmployeeFormError();
      updateEmployeeReadiness();
      refreshIcons();
    }

    function clearEmployeeFormError() {
      $("#employeeFormError").classList.remove("is-visible");
      $$("[data-employee-field]").forEach(field => field.removeAttribute("aria-invalid"));
    }

    function showEmployeeFormError(message, fields = []) {
      $("#employeeFormErrorText").textContent = message;
      $("#employeeFormError").classList.add("is-visible");
      fields.forEach(field => field.setAttribute("aria-invalid", "true"));
      $("#employeeFormError").scrollIntoView({ behavior: "smooth", block: "center" });
      refreshIcons();
    }

    function validateEmployeeForm(record, requireMinimum = true) {
      const requiredFields = $$("[data-employee-field][required]");
      const missing = requiredFields.filter(field => !record[field.dataset.employeeField]);
      if (missing.length) {
        return { valid: false, message: "Complete the required employee fields before creating the employee.", fields: missing };
      }
      const emailField = $('[data-employee-field="email"]');
      if (record.email && !emailField.validity.valid) {
        return { valid: false, message: "Enter a valid email address.", fields: [emailField] };
      }
      if (requireMinimum && employeeReadiness(record).completed < 2) {
        return { valid: false, message: "Complete at least Employment Basics and Organization Assignment before creating the employee.", fields: [] };
      }
      return { valid: true, message: "", fields: [] };
    }

    function emptyEmployeeRecord() {
      return {
        first_name: "", last_name: "", email: "", phone: "", gender: "",
        employee_type: "", employment_subtype: "", date_of_joining: "", status: "Active",
        parent_entity_id: "", location_id: "", department_id: "", designation_id: "",
        reporting_manager_id: "", employee_category: "", is_reporting_manager_eligible: "false",
        date_of_birth: "", blood_group: "", marital_status: "", nationality: "Indian",
        guardian_name: "", spouse_name: "",
        present_address: "", address_city: "", address_state: "", address_pincode: "",
        same_as_present: "true", permanent_address: "",
        emergency_contact_name: "", emergency_relationship: "", emergency_phone: "",
        emergency_alt_phone: "", emergency_address: "",
        aadhaar_number: "", pan_number: "", uan_number: "", pf_number: "",
        esi_number: "", nominee_name: "",
        bank_name: "", branch_name: "", account_number: "", ifsc_code: "",
        bank_verification_status: "",
        document_type: "", document_number: "", document_status: "",
        primary_skill: "", skill_level: "",
        login_id: "", role_id: "", is_salesperson: "false", face_registered: "false",
        default_shift_id: "", shift_preference_mode: "", preferred_week_off_day: "",
        shift_restriction_note: ""
      };
    }

    function mapDbRowToEmployeeRow(dbRow) {
      const fullName = `${dbRow.first_name || ""} ${dbRow.last_name || ""}`.trim();
      const locationLabel = dbRow.location_name || "Not assigned";
      const designationLabel = dbRow.designation_name || "Not assigned";
      const profileStatus = dbRow.status === "Active" ? "Complete" : "Incomplete Profile";
      return [
        dbRow.employee_code || String(dbRow.employee_id),
        fullName,
        locationLabel,
        designationLabel,
        profileStatus,
        dbRow.status || "Active"
      ];
    }

    async function createEmployeeRecord(record, asDraft = false) {
      const api = window.IndipetHRMS?.api;
      const mode = window.IndipetHRMS?.dataMode;
      let employeeCode;

      if (mode === "api" && api) {
        const payload = { ...record };
        if (asDraft) payload.status = "Draft";
        if (editingEmployeeId) {
          const updated = await fetch(`/api/employees/${editingEmployeeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
          employeeCode = updated.employee_code || String(updated.employee_id);
          const row = mapDbRowToEmployeeRow(updated);
          const config = pageConfig["employee-master"];
          const idx = employeeMasterData.findIndex(e => e.employee_id === editingEmployeeId);
          if (idx >= 0) {
            employeeMasterData[idx] = updated;
            config.rows[idx] = row;
          }
          showToast(`${employeeFullName(record)} updated.`);
        } else {
          const created = await api.employees.create(payload);
          employeeCode = created.employee_code || String(created.employee_id);
          const row = mapDbRowToEmployeeRow(created);
          employeeMasterData.push(created);
          pageConfig["employee-master"].rows.push(row);
        }
      } else {
        if (editingEmployeeId) {
          const idx = employeeMasterData.findIndex(e => e.employee_id === editingEmployeeId);
          employeeCode = employeeMasterData[idx]?.employee_code || generateEmployeeId(record);
          if (idx >= 0) {
            Object.assign(employeeMasterData[idx], record);
            const readiness = employeeReadiness(record);
            const profileStatus = readiness.percent === 100 ? "Complete" : readiness.percent >= 50 ? "Continue Setup" : "Incomplete Profile";
            pageConfig["employee-master"].rows[idx] = [
              employeeCode,
              employeeFullName(record),
              record.location_id ? employeeLabelFromSelect("location_id", record.location_id).replace(/^.*? - /, "") : "Not assigned",
              record.designation_id ? employeeLabelFromSelect("designation_id", record.designation_id).replace(/^.*? - /, "") : "Not assigned",
              profileStatus,
              record.status || "Active"
            ];
          }
          showToast(`${employeeFullName(record)} updated.`);
        } else {
          const employeeId = generateEmployeeId(record);
          employeeCode = employeeId;
          const readiness = employeeReadiness(record);
          const profileStatus = readiness.percent === 100 ? "Complete" : readiness.percent >= 50 ? "Continue Setup" : "Incomplete Profile";
          const employeeStatus = asDraft ? "Draft" : record.status || "Active";
          pageConfig["employee-master"].rows.push([
            employeeId,
            employeeFullName(record),
            record.location_id ? employeeLabelFromSelect("location_id", record.location_id).replace(/^.*? - /, "") : "Not assigned",
            record.designation_id ? employeeLabelFromSelect("designation_id", record.designation_id).replace(/^.*? - /, "") : "Not assigned",
            profileStatus,
            employeeStatus
          ]);
          const employeeRecord = { ...record, employee_id: employeeId, employee_code: employeeCode, status: employeeStatus };
          employeeMasterData.push(employeeRecord);
        }
      }
      pageConfig["employee-master"].values = [
        String(pageConfig["employee-master"].rows.length),
        String(pageConfig["employee-master"].rows.filter(row => row[4] === "Complete").length),
        String(pageConfig["employee-master"].rows.filter(row => row[4] !== "Complete").length)
      ];
      selectedEmployeeId = employeeCode;
      activatePage("employee-master");
      $("#moduleSearch").value = employeeCode;
      renderModule("employee-master");
      if (!editingEmployeeId) {
        showToast(`${employeeFullName(record)} ${asDraft ? "saved as draft" : "created"} and selected.`);
      }
      editingEmployeeId = null;
    }

    function openGroup(groupElement, forceOpen = null) {
      const parent = $(".nav-parent", groupElement);
      const children = $(".nav-children", groupElement);
      const shouldOpen = forceOpen === null ? !parent.classList.contains("is-open") : forceOpen;
      if (shouldOpen) {
        $$(".nav-group").forEach(otherGroup => {
          if (otherGroup === groupElement) return;
          $(".nav-parent", otherGroup).classList.remove("is-open");
          $(".nav-children", otherGroup).classList.remove("is-open");
        });
      }
      parent.classList.toggle("is-open", shouldOpen);
      children.classList.toggle("is-open", shouldOpen);
    }

    function activatePage(pageKey) {
      hoursEditMode = false;
      hoursDraft = null;
      activePage = pageKey;
      $$(".nav-single, .nav-child").forEach(button => button.classList.remove("is-active"));
      $("#dashboardView").classList.remove("is-active");
      $("#locationControlView").classList.remove("is-active");
      $("#locationFormView").classList.remove("is-active");
      $("#entityFormView").classList.remove("is-active");
      $("#employeeFormView").classList.remove("is-active");
      $("#departmentFormView").classList.remove("is-active");
      $("#designationFormView").classList.remove("is-active");
      $("#roleFormView").classList.remove("is-active");
      $("#leaveTypeFormView").classList.remove("is-active");
      $("#leavePolicyFormView").classList.remove("is-active");
      $("#policyVariantFormView").classList.remove("is-active");
      $("#policyAssignmentFormView").classList.remove("is-active");
      $("#holidayCalendarFormView").classList.remove("is-active");
      $("#leaveRequestFormView").classList.remove("is-active");
      $("#attendanceFormView").classList.remove("is-active");
      $("#regularizationFormView").classList.remove("is-active");
      $("#shiftExceptionFormView").classList.remove("is-active");
      $("#coLedgerFormView").classList.remove("is-active");
      $("#attendanceReportFormView").classList.remove("is-active");
      $("#moduleView").classList.remove("is-active");
      if (pageKey === "dashboard") {
        $$(".nav-parent").forEach(parent => parent.classList.remove("is-open"));
        $$(".nav-children").forEach(children => children.classList.remove("is-open"));
        $('[data-page="dashboard"]').classList.add("is-active");
        $("#dashboardView").classList.add("is-active");
        setPageHeader("Dashboard", "Operations Dashboard", "Monitor today's workforce, roster coverage, leave decisions and attendance exceptions across Indipet locations.", "Add Employee", "user-plus");
      } else if (pageKey === "sub-location") {
        const target = $('.nav-child[data-page="sub-location"]');
        target.classList.add("is-active");
        openGroup(target.closest(".nav-group"), true);
        $("#locationControlView").classList.add("is-active");
        setPageHeader(
          "Organization",
          "Sub Location Control Center",
          "Manage locations, operating hours, services, delivery zones, onboarding and shift policies from one workspace.",
          "Add New Location",
          "plus"
        );
        $("#exportButton").innerHTML = `<i data-lucide="clipboard-check"></i>Run Readiness Check`;
        renderLocationControl();
      } else {
        const target = $(`.nav-single[data-page="${pageKey}"], .nav-child[data-page="${pageKey}"], .support-button[data-page="${pageKey}"]`);
        if (target) {
          target.classList.add("is-active");
          const group = target.closest(".nav-group");
          if (group) openGroup(group, true);
        }
        const config = pageConfig[pageKey];
        if (!config) return;
        $("#moduleView").classList.add("is-active");
        setPageHeader(config.parent, config.title, config.description, config.action, config.icon);
        if (!$("#moduleSearch") || !$("#moduleLocation") || !$("#moduleStatus")) {
          restoreGenericModuleFilters();
        }
        $("#moduleSearch").value = "";
        $("#moduleLocation").value = "all";
        $("#moduleStatus").value = "all";
        renderModule(pageKey);
      }
      closeMobileMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      refreshIcons();
    }

    function setBreadcrumb(parts) {
      $("#breadcrumb").innerHTML = parts.map((part, index) => `
        ${index ? `<i data-lucide="chevron-right"></i>` : ""}
        <span ${index === parts.length - 1 ? `id="breadcrumbCurrent"` : ""}>${part}</span>
      `).join("");
    }

    function setPageHeader(parent, title, description, action, icon) {
      setBreadcrumb(parent === "Dashboard" ? ["HRMS", "Dashboard"] : ["HRMS", parent, title]);
      $("#pageTitle").textContent = title;
      $("#pageDescription").textContent = description;
      $(".page-actions").classList.remove("is-form-page");
      $("#exportButton").style.display = "";
      $("#exportButton").innerHTML = `<i data-lucide="download"></i>Export`;
      $("#primaryAction").className = "button primary";
      $("#primaryAction").innerHTML = `<i data-lucide="${icon}"></i>${action}`;
      $("#modalTitle").textContent = action;
      $("#modalSubtitle").textContent = `${action} in ${title}`;
    }

    function showToast(message) {
      const toastText = $("#toastText");
      if (toastText) toastText.textContent = message;
      const toast = $("#toast");
      if (toast) toast.classList.add("is-visible");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => {
        const t = $("#toast");
        if (t) t.classList.remove("is-visible");
      }, 2600);
    }

    function openModal() {
      $("#recordModal").classList.add("is-open");
      setTimeout(() => $("#recordName").focus(), 50);
    }

    function closeModal() {
      $("#recordModal").classList.remove("is-open");
    }

    function openDrawer() {
      $("#notificationDrawer").classList.add("is-open");
      $("#drawerBackdrop").classList.add("is-open");
      $("#notificationDrawer").setAttribute("aria-hidden", "false");
    }

    function closeDrawer() {
      $("#notificationDrawer").classList.remove("is-open");
      $("#drawerBackdrop").classList.remove("is-open");
      $("#notificationDrawer").setAttribute("aria-hidden", "true");
    }

    function openMobileMenu() {
      $("#sidebar").classList.add("is-mobile-open");
      $("#mobileBackdrop").classList.add("is-open");
    }

    function closeMobileMenu() {
      $("#sidebar").classList.remove("is-mobile-open");
      $("#mobileBackdrop").classList.remove("is-open");
    }

    $$(".nav-parent").forEach(parent => {
      parent.addEventListener("click", () => openGroup(parent.closest(".nav-group")));
    });

    $$("[data-page]").forEach(button => {
      button.addEventListener("click", () => activatePage(button.dataset.page));
    });

    $$("[data-nav-target]").forEach(button => {
      button.addEventListener("click", () => activatePage(button.dataset.navTarget));
    });

    $("#collapseSidebar").addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");
      $("#collapseSidebar").innerHTML = `<i data-lucide="${document.body.classList.contains("sidebar-collapsed") ? "panel-left-open" : "panel-left-close"}"></i>`;
      refreshIcons();
    });

    $("#mobileMenu").addEventListener("click", openMobileMenu);
    $("#mobileBackdrop").addEventListener("click", closeMobileMenu);
    $("#notificationButton").addEventListener("click", openDrawer);
    $("#closeDrawer").addEventListener("click", closeDrawer);
    $("#drawerBackdrop").addEventListener("click", closeDrawer);
    $("#primaryAction").addEventListener("click", () => {
      if (activePage === "dashboard") {
        activatePage("employee-master");
        openEmployeeForm();
        return;
      }
      if (activePage === "entity-master") {
        openEntityForm();
        return;
      }
      if (activePage === "entity-master-form") {
        activatePage("entity-master");
        return;
      }
      if (activePage === "employee-master") {
        openEmployeeForm();
        return;
      }
      if (activePage === "employee-master-form") {
        activatePage("employee-master");
        return;
      }
      if (activePage === "sub-location") {
        openLocationForm("create");
        return;
      }
      if (activePage === "sub-location-form") {
        activatePage("sub-location");
        return;
      }
      if (activePage === "department-master") {
        openDepartmentForm("create");
        return;
      }
      if (activePage === "department-master-form") {
        activatePage("department-master");
        return;
      }
      if (activePage === "designation-master") {
        openDesignationForm("create");
        return;
      }
      if (activePage === "designation-master-form") {
        activatePage("designation-master");
        return;
      }
      if (activePage === "role-manager") {
        openRoleForm("create");
        return;
      }
      if (activePage === "role-manager-form") {
        activatePage("role-manager");
        return;
      }
      if (activePage === "roster") {
        openRosterGenerateModal();
        return;
      }
      if (activePage === "roster-board") {
        activatePage("roster");
        return;
      }
      if (activePage === "leave-type-master") { openLeaveTypeForm(); return; }
      if (activePage === "leave-type-master-form") { activatePage("leave-type-master"); return; }
      if (activePage === "leave-policy") { openLeavePolicyForm(); return; }
      if (activePage === "leave-policy-form") { activatePage("leave-policy"); return; }
      if (activePage === "policy-variants") { openPolicyVariantForm(); return; }
      if (activePage === "policy-variants-form") { activatePage("policy-variants"); return; }
      if (activePage === "policy-assignments") { openPolicyAssignmentForm(); return; }
      if (activePage === "policy-assignments-form") { activatePage("policy-assignments"); return; }
      if (activePage === "holiday-calendar") { openHolidayCalendarForm(); return; }
      if (activePage === "holiday-calendar-form") { activatePage("holiday-calendar"); return; }
      if (activePage === "leave-requests") { openLeaveRequestForm(); return; }
      if (activePage === "leave-requests-form") { activatePage("leave-requests"); return; }
      if (activePage === "attendance-list") { openAttendanceForm(); return; }
      if (activePage === "attendance-form") { activatePage("attendance-list"); return; }
      if (activePage === "regularization") { openRegularizationForm(); return; }
      if (activePage === "regularization-form") { activatePage("regularization"); return; }
      if (activePage === "shift-exceptions") { openShiftExceptionForm(); return; }
      if (activePage === "shift-exceptions-form") { activatePage("shift-exceptions"); return; }
      if (activePage === "co-ledger") { openCoLedgerForm(); return; }
      if (activePage === "co-ledger-form") { activatePage("co-ledger"); return; }
      if (activePage === "attendance-reports") { openAttendanceReportForm(); return; }
      if (activePage === "attendance-reports-form") { activatePage("attendance-reports"); return; }
      openModal();
    });
    $("#quickAdd").addEventListener("click", openModal);
    $$(".close-modal").forEach(button => button.addEventListener("click", closeModal));
    $("#recordModal").addEventListener("click", event => {
      if (event.target === $("#recordModal")) closeModal();
    });

    $("#recordForm").addEventListener("submit", event => {
      event.preventDefault();
      const name = $("#recordName").value.trim();
      closeModal();
      event.target.reset();
      showToast(`${name || "Record"} created as a draft.`);
    });

    $("#closeShiftPolicyModal").addEventListener("click", closeShiftPolicyModal);
    $("#cancelShiftPolicy").addEventListener("click", closeShiftPolicyModal);
    $("#shiftPolicyModal").addEventListener("click", event => {
      if (event.target === $("#shiftPolicyModal")) closeShiftPolicyModal();
    });
    $("#shiftPolicyModal").addEventListener("change", event => {
      const timePart = event.target.closest("[data-shift-time-field]");
      if (!timePart) return;
      syncShiftTimeField(timePart.dataset.shiftTimeField);
      $("#shiftStartTime").removeAttribute("aria-invalid");
      $("#shiftEndTime").removeAttribute("aria-invalid");
      $("#shiftPolicyError").classList.remove("is-visible");
      updateShiftPolicyCalculations();
    });
    ["shiftPolicyName", "shiftPolicyStatus", "shiftCoverageRole", "shiftStartTime", "shiftEndTime", "shiftBreakMinutes", "shiftRequiredStaff", "shiftDailyLeaveLimit", "shiftWeeklyOffPattern", "shiftWeeklyOffDay", "shiftMaxConsecutiveDays", "shiftPrimaryKeyholder", "shiftBackupKeyholder"].forEach(id => {
      $(`#${id}`).addEventListener("input", () => {
        $(`#${id}`).removeAttribute("aria-invalid");
        $("#shiftPolicyError").classList.remove("is-visible");
        updateShiftPolicyCalculations();
      });
      $(`#${id}`).addEventListener("change", () => {
        $(`#${id}`).removeAttribute("aria-invalid");
        $("#shiftPolicyError").classList.remove("is-visible");
        updateShiftPolicyCalculations();
        if (id === "shiftCoverageRole") updateShiftCoverageRoleControls();
        if (id === "shiftWeeklyOffPattern") updateShiftWeeklyOffControls();
        if (id === "shiftPrimaryKeyholder") updateShiftKeyholderControls();
      });
    });
    $$("[data-keyholder-required]").forEach(button => {
      button.addEventListener("click", () => {
        shiftPolicyKeyholderRequired = button.dataset.keyholderRequired === "true";
        updateShiftKeyholderControls();
        $("#shiftPolicyError").classList.remove("is-visible");
      });
    });
    $("#shiftPolicyForm").addEventListener("submit", event => {
      event.preventDefault();
      clearShiftPolicyError();
      updateShiftPolicyCalculations();
      updateShiftWeeklyOffControls();
      updateShiftKeyholderControls();
      const record = collectShiftPolicyFormRecord();
      const validation = validateShiftPolicyRecord(record);
      if (!validation.valid) {
        showShiftPolicyError(validation.message, validation.fields);
        return;
      }
      createShiftPolicy(record);
    });

    const closeModalBtn = $("#closeRosterGenerateModal");
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeRosterGenerateModal);
    const cancelBtn = $("#cancelRosterGenerate");
    if (cancelBtn) cancelBtn.addEventListener("click", closeRosterGenerateModal);
    const closeReviewBtn = $("#closeRosterReview");
    if (closeReviewBtn) closeReviewBtn.addEventListener("click", closeRosterGenerateModal);
    const rosterGenModal = $("#rosterGenerateModal");
    if (rosterGenModal) {
      rosterGenModal.addEventListener("click", event => {
        if (event.target === rosterGenModal) closeRosterGenerateModal();
      });
    }
    const rosterStartEl = $("#rosterStartDate");
    if (rosterStartEl) {
      rosterStartEl.addEventListener("change", () => {
        if (rosterStartEl.value) {
          const wh = $("#rosterWeekHelp");
          if (wh) wh.textContent = `Roster period starts ${formatShortDate(rosterStartEl.value)}.`;
        }
      });
    }
    $("#backRosterGenerate").addEventListener("click", () => setRosterGenerateStep(1));
    const backBtn = $("#backRosterGenerate");
    if (backBtn) backBtn.addEventListener("click", () => setRosterGenerateStep(1));
    const rosterForm = $("#rosterGenerateForm");
    if (rosterForm) {
      rosterForm.addEventListener("submit", async event => {
        event.preventDefault();
        const submitBtn = $("#runRosterGenerate");
        if (!submitBtn) return;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-circle"></i>Generating...`;
        refreshIcons();
        const setup = collectRosterGenerateSetup();
        const validationMessage = validateRosterGenerateSetup(setup);
        if (validationMessage) {
          showToast(validationMessage);
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i data-lucide="wand-sparkles"></i>Generate Roster`;
          refreshIcons();
          return;
        }
        rosterGeneratedSetup = setup;
        try {
          rosterGeneratedResult = await generateRosterPreview(setup);
          renderRosterReview(rosterGeneratedResult);
          setRosterGenerateStep(2);
        } catch (err) {
          console.error("Roster generation failed:", err);
          showToast("Roster preview generation failed. Check console for details.");
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i data-lucide="wand-sparkles"></i>Generate Roster`;
          refreshIcons();
        }
      });
    }
    const confirmDraftBtn = $("#confirmRosterDraft");
    if (confirmDraftBtn) {
      confirmDraftBtn.addEventListener("click", () => {
        if (!rosterGeneratedResult) return;
        const loc = rosterGeneratedResult.location || {};
        const period = rosterGeneratedResult.period || {};
        const periodStr = period.start && period.end
          ? `${formatShortDate(period.start)} — ${formatShortDate(period.end)}`
          : "selected period";
        closeRosterGenerateModal();
        showToast(`${loc.listName || "Location"} roster draft saved for ${periodStr}.`);
      });
    }
    const publishBtn = $("#publishRoster");
    if (publishBtn) {
      publishBtn.addEventListener("click", async () => {
        if (!rosterGeneratedResult) return;
        const result = rosterGeneratedResult;
        const loc = result.location || {};
        const period = result.period || {};
        const startDate = period.start;
        const endDate = period.end;
        const periodStr = startDate && endDate
          ? `${formatShortDate(startDate)} — ${formatShortDate(endDate)}`
          : "selected period";
        const coverage = result.coverage || {};
        const dates = result.dates || [];
        let openSlots = 0;
        for (const dateObj of dates) {
          const dayCoverage = coverage[dateObj.iso];
          if (dayCoverage && !dayCoverage.isStoreClosed) {
            for (const cs of (dayCoverage.shifts || [])) {
              openSlots += Number(cs.gap) || 0;
            }
          }
        }
        const conflicts = (result.validation || []).length;
        const summary = result.summary || {};
        const sTotal = summary.totalSlots || 0;
        const totalDays = summary.totalDays || dates.length;
        const totalEmps = summary.totalEmployees || 0;
        const filled = Math.min(totalEmps * totalDays, sTotal - openSlots);

        const api = window.IndipetHRMS?.api;

        try {
          if (api) {
            const existingList = await api.rosters.list({
              location_id: loc.dbId || loc.id,
              status: "Published"
            });
            let nextVersion = "v1";
            if (existingList && existingList.length > 0) {
              const sorted = existingList.sort((a, b) => {
                const va = parseInt((a.version || "v0").replace("v", "")) || 0;
                const vb = parseInt((b.version || "v0").replace("v", "")) || 0;
                return vb - va;
              });
              const latest = sorted[0];
              const latestNum = parseInt((latest.version || "v0").replace("v", "")) || 0;
              nextVersion = `v${latestNum + 1}`;
              for (const old of existingList) {
                await api.rosters.update(old.rosterId, { status: "Superseded" });
              }
            }
            const payload = {
              location_id: loc.dbId || loc.id,
              start_date: startDate,
              end_date: endDate,
              version: nextVersion,
              status: "Published",
              filled_slots: filled,
              open_slots: openSlots,
              conflicts: conflicts,
              roster_data: {
                dates: result.dates,
                employees: result.employees,
                shifts: result.shifts,
                allocation: result.allocation,
                coverage: result.coverage,
                validation: result.validation,
                summary: result.summary,
              },
            };
            await api.rosters.create(payload);
            publishedRosters = await api.rosters.list();
          } else {
            const existing = publishedRosters.findIndex(r =>
              r.locationId === (loc.id || loc.dbId) && r.period === periodStr
            );
            if (existing !== -1) {
              publishedRosters[existing].status = "Superseded";
            }
            const version = existing !== -1
              ? `v${(parseInt(publishedRosters[existing]?.version?.replace("v", "") || "0") + 1)}`
              : "v1";
            publishedRosters.push({
              rosterId: "pub_" + Date.now(),
              locationId: loc.id || loc.dbId,
              locationName: loc.listName || loc.name,
              period: periodStr,
              version,
              status: "Published",
              filled,
              open: openSlots,
              conflicts,
              keyholder: "Configured",
              updated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              issue: conflicts ? "Has Issues" : "Ready",
              displayName: loc.name,
              activeShifts: result.shifts || [],
            });
          }
        } catch (err) {
          console.error("Publish error:", err);
          showToast("Failed to publish roster to server. Saved locally.");
          const existing = publishedRosters.findIndex(r =>
            r.locationId === (loc.id || loc.dbId) && r.period === periodStr
          );
          if (existing !== -1) {
            publishedRosters[existing].status = "Superseded";
          }
          const version = existing !== -1
            ? `v${(parseInt(publishedRosters[existing]?.version?.replace("v", "") || "0") + 1)}`
            : "v1";
          publishedRosters.push({
            rosterId: "pub_" + Date.now(),
            locationId: loc.id || loc.dbId,
            locationName: loc.listName || loc.name,
            period: periodStr,
            version,
            status: "Published",
            filled,
            open: openSlots,
            conflicts,
            keyholder: "Configured",
            updated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            issue: conflicts ? "Has Issues" : "Ready",
            displayName: loc.name,
            activeShifts: result.shifts || [],
          });
        }
        closeRosterGenerateModal();
        showToast(`${loc.listName || "Location"} roster published for ${periodStr}.`);
      });
    }

    $("#exportButton").addEventListener("click", () => {
      if (activePage === "sub-location") {
        const loc = getSelectedLocation();
        showToast(loc ? `${loc.listName} readiness check completed.` : "No location selected.");
        return;
      }
      showToast(`${$("#pageTitle").textContent} export prepared.`);
    });
    $("#columnButton").addEventListener("click", () => showToast("Column preferences opened for this table."));
    $("#profileButton").addEventListener("click", () => showToast("Signed in as HR & Operations Admin."));

    $("#chartLocation").addEventListener("change", event => {
      const multipliers = { "All Locations": 1, "Corporate HQ": 0.42, "Lake Gardens": 0.56, "Newtown": 0.37, "Rajarhat": 0.31 };
      renderWeeklyChart(multipliers[event.target.value] || 1);
    });

    const attendanceCard = $("#dashboardView .table-card");
    $(".record-search", attendanceCard).addEventListener("input", () => {
      attendancePage = 1;
      renderAttendance();
    });
    $(".location-filter", attendanceCard).addEventListener("change", () => {
      attendancePage = 1;
      renderAttendance();
    });
    $(".status-filter", attendanceCard).addEventListener("change", () => {
      attendancePage = 1;
      renderAttendance();
    });
    $(".reset-filters", attendanceCard).addEventListener("click", () => {
      $(".record-search", attendanceCard).value = "";
      $(".location-filter", attendanceCard).value = "all";
      $(".status-filter", attendanceCard).value = "all";
      attendancePage = 1;
      renderAttendance();
    });
    $(".page-prev", attendanceCard).addEventListener("click", () => {
      attendancePage = Math.max(1, attendancePage - 1);
      renderAttendance();
    });
    $(".page-next", attendanceCard).addEventListener("click", () => {
      attendancePage += 1;
      renderAttendance();
    });
    $(".page-buttons", attendanceCard).addEventListener("click", event => {
      const button = event.target.closest(".page-button:not(.page-prev):not(.page-next)");
      if (!button) return;
      attendancePage = Number(button.textContent);
      renderAttendance();
    });
    $(".select-all", attendanceCard).addEventListener("change", event => {
      $$(".row-checkbox", attendanceCard).forEach(box => box.checked = event.target.checked);
      updateBulkBar(attendanceCard);
    });
    $(".records-body", attendanceCard).addEventListener("change", event => {
      if (event.target.matches(".row-checkbox")) updateBulkBar(attendanceCard);
    });
    $(".records-body", attendanceCard).addEventListener("click", event => {
      const menuButton = event.target.closest(".row-menu-button");
      if (menuButton) {
        const menu = $(".row-menu", menuButton.parentElement);
        $$(".row-menu").forEach(item => {
          if (item !== menu) item.classList.remove("is-open");
        });
        menu.classList.toggle("is-open");
        return;
      }
      const action = event.target.closest("[data-row-action]");
      if (action) {
        const row = action.closest("tr");
        $(".row-menu", row).classList.remove("is-open");
        if (action.dataset.rowAction === "edit") {
          const recordId = row.dataset.recordId;
          const record = attendanceRecords.find(r => String(r.id) === String(recordId));
          openAttendanceForm(record);
          return;
        }
        showToast(`${action.textContent.trim()} opened for ${row.dataset.recordId}.`);
      }
    });

    ["moduleSearch", "moduleLocation", "moduleStatus"].forEach(id => {
      const eventName = id === "moduleSearch" ? "input" : "change";
      $(`#${id}`).addEventListener(eventName, () => renderModule(activePage));
    });
    $("#moduleReset").addEventListener("click", () => {
      $("#moduleSearch").value = "";
      $("#moduleLocation").value = "all";
      $("#moduleStatus").value = "all";
      renderModule(activePage);
    });
    const moduleActionHandlers = {
      "entity-master": (row, rowIndex) => {
        const record = entityMasterData[rowIndex];
        openEntityForm(record);
      },
      "employee-master": (row, rowIndex) => {
        const record = employeeMasterData[rowIndex];
        openEmployeeForm(record);
      },
      "department-master": (row, rowIndex) => {
        let record = departmentMasterData[rowIndex];
        if (!record) {
          record = {
            department_code: row[0],
            department_name: row[1],
            department_short_code: row[2],
            revenue_centre_code: row[3],
            is_revenue_generating: row[4] === "Yes" ? "true" : "false",
            status: (row[5] || "active").toLowerCase()
          };
        }
        openDepartmentForm("edit", record);
      },
      "designation-master": (row, rowIndex) => {
        let record = designationMasterData[rowIndex];
        if (!record) {
          record = {
            designation_code: row[0],
            designation_name: row[1],
            department_id: row[2] || "",
            grade_code: row[3] || "",
            is_keyholder_eligible: row[4] === "Yes" ? "true" : "false",
            status: (row[5] || "active").toLowerCase()
          };
        }
        openDesignationForm("edit", record);
      },
      "role-manager": (row, rowIndex) => {
        let record = roleMasterData[rowIndex];
        if (!record) {
          record = {
            role_code: row[0],
            role_name: row[1],
            status: row[2] || "Active"
          };
        }
        openRoleForm("edit", record);
      },
      "leave-type-master": (row, rowIndex) => {
        let record = leaveTypeData[rowIndex];
        if (!record) {
          record = {
            leave_code: row[0],
            leave_name: row[1],
            is_paid: row[2] === "Yes" ? "true" : "false",
            accrual_type: row[3] || ""
          };
        }
        openLeaveTypeForm(record);
      },
      "leave-policy": (row, rowIndex) => {
        let record = leavePolicyData[rowIndex];
        if (!record) {
          record = {
            policy_name: row[1],
            policy_year: row[2]
          };
        }
        openLeavePolicyForm(record);
      },
      "leave-requests": (row, rowIndex) => {
        let record = leaveRequestData[rowIndex];
        if (!record) {
          record = {
            request_id: row[0],
            employee_id: row[1]?.match(/\d+$/)?.[0] || "",
            leave_type_id: row[2],
            start_date: row[3]?.split(" to ")?.[0] || "",
            end_date: row[3]?.split(" to ")?.[1] || row[3]?.split(" to ")?.[0] || ""
          };
        }
        openLeaveRequestForm(record);
      },
      "attendance-list": (row, rowIndex) => {
        let record = attendanceData[rowIndex];
        if (!record) {
          record = {
            employee_id: row[0],
            attendance_date: ""
          };
        }
        openAttendanceForm(record);
      },
      "regularization": (row, rowIndex) => {
        let record = regularizationData[rowIndex];
        if (!record) {
          record = {
            employee_id: row[1]?.match(/\d+$/)?.[0] || "",
            issue_type: (row[2] || "").replace(/ /g, "_").toLowerCase(),
            attendance_date: row[3] || ""
          };
        }
        openRegularizationForm(record);
      },
      "shift-exceptions": (row, rowIndex) => {
        let record = shiftExceptionData[rowIndex];
        if (!record) {
          record = {
            employee_id: row[0],
            exception_type: (row[1] || "").replace(/ /g, "_").toLowerCase(),
            exception_date: row[3] || ""
          };
        }
        openShiftExceptionForm(record);
      },
      "co-ledger": (row, rowIndex) => {
        let record = coLedgerData[rowIndex];
        if (!record) {
          record = {
            employee_id: row[0],
            entry_type: row[1] || "",
            units: row[2] || "0"
          };
        }
        openCoLedgerForm(record);
      },
    };

    $("#moduleView").addEventListener("click", event => {
      const ctrlTab = event.target.closest("[data-roster-control-tab]");
      if (ctrlTab) {
        rosterControlTab = ctrlTab.dataset.rosterControlTab;
        renderRosterControlCenter();
        return;
      }
      const publishedView = event.target.closest(".roster-published-view");
      if (publishedView) {
        const rosterId = publishedView.dataset.rosterView;
        const locationId = publishedView.dataset.rosterLocation;
        if (rosterId) {
          openRosterBoardPublished(rosterId, locationId);
          return;
        }
        selectedLocationId = locationId;
        const record = rosterOverviewRecords().find(r => r.locationId === selectedLocationId);
        openRosterBoard(record?.rosterId || "", selectedLocationId);
        return;
      }
      const publishedEdit = event.target.closest(".roster-published-edit");
      if (publishedEdit) {
        const rosterId = publishedEdit.dataset.rosterView;
        const locationId = publishedEdit.dataset.rosterLocation;
        if (rosterId) {
          openRosterBoardPublished(rosterId, locationId);
          return;
        }
        selectedLocationId = locationId;
        const location = subLocations.find(item => item.id === selectedLocationId) || getSelectedLocation();
        showToast(`Edit view for ${location.listName}.`);
        return;
      }
      const rosterPrimary = event.target.closest(".roster-row-primary");
      if (rosterPrimary) {
        const action = rosterPrimary.dataset.rosterPrimary;
        selectedLocationId = rosterPrimary.dataset.locationId;
        if (action === "view") {
          openRosterBoard(rosterPrimary.dataset.rosterId, rosterPrimary.dataset.locationId);
          return;
        }
        if (action === "generate") {
          openRosterGenerateModal({ lockedLocation: true });
          return;
        }
        if (action === "publish") {
          showToast("Roster is ready for publish review.");
          return;
        }
        return;
      }
      if (event.target.closest("[data-roster-more]")) {
        showToast("Roster history, export and cancel draft actions are ready for workflow integration.");
        return;
      }
      const rosterBoardTab = event.target.closest("[data-roster-board-tab]");
      if (rosterBoardTab) {
        setRosterBoardTab(rosterBoardTab.dataset.rosterBoardTab);
        return;
      }
      const boardAction = event.target.closest("[data-roster-board-action]");
      if (boardAction) {
        const locationId = boardAction.dataset.locationId;
        const location = subLocations.find(item => item.id === locationId) || getSelectedLocation();
        selectedLocationId = location.id;
        const action = boardAction.dataset.rosterBoardAction;
        if (action === "validate") {
          showToast(`${location.listName} roster validation refreshed.`);
          return;
        }
        if (action === "generate") {
          openRosterGenerateModal({ lockedLocation: true });
          return;
        }
        if (action === "shift-policy") {
          activeLocationTab = "shift-policy";
          activatePage("sub-location");
          showToast(`Open Location Shift Policy for ${location.listName}.`);
          return;
        }
        if (action === "revision") {
          showToast(`Revision draft opened for ${location.listName}.`);
          return;
        }
        if (action === "edit") {
          showToast(`Roster draft editing enabled for ${location.listName}.`);
          return;
        }
        if (action === "open-slot") {
          showToast(`Open-slot assignment panel opened for ${location.listName}.`);
          return;
        }
        if (action === "publish") {
          showToast(`${location.listName} roster is ready for publish workflow.`);
          return;
        }
        if (action === "export") {
          showToast(`${location.listName} roster export prepared.`);
          return;
        }
        if (action === "history") {
          showToast(`${location.listName} roster history opened.`);
          return;
        }
        if (action === "refresh") {
          if (currentPublishedRosterData) {
            renderRosterBoardFromData(currentPublishedRosterData, location);
          } else {
            renderRosterBoard(currentRosterBoardRecord, location);
          }
          return;
        }
        if (action === "save-draft") {
          (async () => {
            if (!currentPublishedRosterData || !publishedRosterDirty) {
              showToast("No changes to save.");
              return;
            }
            const api = window.IndipetHRMS?.api;
            if (api) {
              try {
                const existingList = await api.rosters.list({ location_id: location.dbId || location.id, status: "Published" });
                let nextVersion = "v1";
                if (existingList && existingList.length > 0) {
                  const sorted = existingList.sort((a, b) => {
                    const va = parseInt((a.version || "v0").replace("v", "")) || 0;
                    const vb = parseInt((b.version || "v0").replace("v", "")) || 0;
                    return vb - va;
                  });
                  const latestNum = parseInt((sorted[0].version || "v0").replace("v", "")) || 0;
                  nextVersion = `v${latestNum + 1}`;
                }
                const payload = {
                  location_id: location.dbId || location.id,
                  start_date: currentPublishedRosterData.period?.start,
                  end_date: currentPublishedRosterData.period?.end,
                  version: nextVersion,
                  status: "Draft",
                  filled_slots: currentPublishedRosterData.filled,
                  open_slots: currentPublishedRosterData.open,
                  conflicts: currentPublishedRosterData.conflicts,
                  roster_data: {
                    dates: currentPublishedRosterData.dates,
                    employees: currentPublishedRosterData.employees,
                    shifts: currentPublishedRosterData.shifts,
                    allocation: currentPublishedRosterData.allocation,
                    coverage: currentPublishedRosterData.coverage,
                    validation: currentPublishedRosterData.validation,
                    summary: currentPublishedRosterData.summary,
                  },
                };
                await api.rosters.create(payload);
                publishedRosterDirty = false;
                showToast(`Draft revision ${nextVersion} saved.`);
              } catch (err) {
                console.error("Failed to save draft:", err);
                showToast("Failed to save draft revision.");
              }
            } else {
              showToast("API not available for saving.");
            }
          })();
          return;
        }
      }
      if (event.target.closest(".roster-cell-editor")) return;
      const rosterCell = event.target.closest("[data-roster-cell]");
      if (rosterCell && activePage === "roster-board") {
        if (!currentPublishedRosterData) {
          showToast("Editing is only available for published roster views.");
          return;
        }
        const existingPicker = document.querySelector(".roster-cell-editor");
        if (existingPicker) {
          existingPicker.remove();
        }
        const employeeId = rosterCell.dataset.employeeId;
        const dateIso = rosterCell.dataset.rosterDate;
        if (!employeeId || !dateIso) return;
        renderRosterCellPicker(employeeId, dateIso, rosterCell);
        return;
      }
      const menuButton = event.target.closest(".row-menu-button");
      if (menuButton) {
        const menu = menuButton.parentElement.querySelector(".row-menu");
        $$(".row-menu").forEach(item => {
          if (item !== menu) item.classList.remove("is-open");
        });
        if (menu) menu.classList.toggle("is-open");
        return;
      }
      const action = event.target.closest("[data-row-action]");
      if (action) {
        const rowEl = action.closest("tr");
        const rowMenu = rowEl?.querySelector(".row-menu");
        if (rowMenu) rowMenu.classList.remove("is-open");
        const rowIndex = Number(rowEl?.dataset?.rowIndex);
        const config = pageConfig[activePage];
        const rowData = config?.rows?.[rowIndex];
        const handler = moduleActionHandlers[activePage];
        if (handler && rowData) {
          handler(rowData, rowIndex);
        }
        return;
      }
    });

    $("#locationSearch").addEventListener("input", renderLocationList);
    $("#locationFilterButton").addEventListener("click", () => showToast("Location filters opened."));
    $("#locationList").addEventListener("click", event => {
      const item = event.target.closest("[data-location-id]");
      if (!item) return;
      if (hoursEditMode && item.dataset.locationId !== selectedLocationId) {
        showToast("Save or cancel the operating-hour changes before switching locations.");
        return;
      }
      selectedLocationId = item.dataset.locationId;
      renderLocationControl();
    });
    $("#locationTabs").addEventListener("click", event => {
      const tab = event.target.closest("[data-location-tab]");
      if (!tab) return;
      if (hoursEditMode && tab.dataset.locationTab !== "hours") {
        showToast("Save or cancel the operating-hour changes before changing tabs.");
        return;
      }
      activeLocationTab = tab.dataset.locationTab;
      renderLocationTab();
    });
    $("#editLocationButton").addEventListener("click", () => openLocationForm("edit"));
    $("#locationMoreButton").addEventListener("click", () => {
      const loc = getSelectedLocation();
      showToast(loc ? `More location actions opened for ${loc.listName}.` : "No location selected.");
    });
    $("#locationTabContent").addEventListener("click", event => {
      const hoursSwitch = event.target.closest(".hours-switch");
      if (hoursSwitch) {
        if (!hoursEditMode || !hoursDraft) return;
        const row = hoursDraft.find(item => item.dayOfWeek === Number(hoursSwitch.dataset.dayOfWeek));
        if (!row) return;
        row.isOpen = !row.isOpen;
        renderLocationTab();
        return;
      }

      const action = event.target.closest("[data-control-action]");
      if (!action) return;
      if (action.dataset.controlAction === "edit-hours") {
        startHoursEdit();
        return;
      }
      if (action.dataset.controlAction === "cancel-hours") {
        cancelHoursEdit();
        return;
      }
      if (action.dataset.controlAction === "save-hours") {
        saveHoursEdit();
        return;
      }
      if (action.dataset.controlAction === "add-shift-policy") {
        openShiftPolicyModal();
        return;
      }
      if (action.dataset.controlAction === "open-area") {
        const area = action.closest("tr").cells[0].textContent.trim();
        const areaTabs = {
          "Operating Hours": "hours",
          "Service Config": "services",
          "Delivery Zone": "delivery",
          "Onboarding Checklist": "onboarding",
          "Shift Policy": "shift-policy"
        };
        if (areaTabs[area]) {
          activeLocationTab = areaTabs[area];
          renderLocationTab();
          return;
        }
      }

      const labels = {
        readiness: "Readiness check completed.",
        "copy-hours": "Copy operating hours opened.",
        "row-menu": "Record actions opened.",
        "view-validation": "Validation details opened.",
        "add-service": "Add service configuration opened.",
        "add-zone": "Add delivery zone opened.",
        "refresh-checklist": "Onboarding status refreshed.",
        "export-audit": "Location audit export prepared."
      };
      showToast(labels[action.dataset.controlAction] || "Location action opened.");
    });

    $("#locationTabContent").addEventListener("change", event => {
      const timeInput = event.target.closest("[data-hours-field]");
      if (!timeInput || !hoursEditMode || !hoursDraft) return;
      const row = hoursDraft.find(item => item.dayOfWeek === Number(timeInput.dataset.dayOfWeek));
      if (!row) return;
      row[timeInput.dataset.hoursField] = readSplitTimeValue(
        $("#locationTabContent"),
        "data-hours-field",
        "data-hours-time-part",
        timeInput.dataset.hoursField,
        timeInput.dataset.dayOfWeek
      );
      renderLocationTab();
    });

    $("#locationStepper").addEventListener("click", event => {
      const step = event.target.closest("[data-location-step]");
      if (!step) return;
      setLocationStep(Number(step.dataset.locationStep));
    });

    $$("[data-location-field]").forEach(field => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
        const hasInvalid = $$('[data-location-field][aria-invalid="true"]').length > 0;
        if (!hasInvalid) $("#locationFormError").classList.remove("is-visible");
      });
      field.addEventListener("change", () => field.removeAttribute("aria-invalid"));
    });

    $("#cancelLocationForm").addEventListener("click", () => activatePage("sub-location"));
    $("#backLocationStep").addEventListener("click", () => setLocationStep(activeLocationStep - 1));
    $("#nextLocationStep").addEventListener("click", () => setLocationStep(activeLocationStep + 1));
    $("#addShiftPolicyCard").addEventListener("click", addShiftPolicyCard);

    $("#locationForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearLocationFormError();
      const record = collectLocationFormRecord();
      const validation = validateLocationRecord(record);
      if (!validation.valid) {
        const firstInvalid = validation.fields[0]?.closest("[data-location-section]");
        if (firstInvalid) setLocationStep(Number(firstInvalid.dataset.locationSection));
        showLocationFormError(validation.message, validation.fields);
        return;
      }

      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;

        if (mode === "api" && api) {
          if (locationFormMode === "edit") {
            const location = subLocations.find(item => item.id === editingLocationId);
            if (!location) {
              showLocationFormError("The selected location could not be found. Return to the control center and try again.");
              return;
            }
            const locationId = location.dbId;
            if (!locationId) {
              showLocationFormError("Database ID not found for this location.");
              return;
            }
            const updated = await api.locations.update(locationId, record);
            applyLocationRecord(location, { ...updated, ...record });
            selectedLocationId = location.id;
          } else {
            const created = await api.locations.create(record);
            const location = buildLocationFromRecord({ ...record, ...created });
            subLocations.push(location);
            selectedLocationId = location.id;
          }
        } else {
          if (locationFormMode === "edit") {
            const location = subLocations.find(item => item.id === editingLocationId);
            if (!location) {
              showLocationFormError("The selected location could not be found. Return to the control center and try again.");
              return;
            }
            applyLocationRecord(location, record);
            selectedLocationId = record.location_code || location.id;
          } else {
            const location = buildLocationFromRecord(record);
            subLocations.push(location);
            selectedLocationId = location.id;
          }
        }

        activeLocationTab = "overview";
        $("#locationSearch").value = "";
        activatePage("sub-location");
        showToast(locationFormMode === "edit"
          ? `${record.location_name} updated successfully.`
          : `${record.location_name} created and selected.`);
      } catch (error) {
        showLocationFormError(error.message || "The location could not be saved. Review the entered values and try again.");
      }
    });

    $("#cancelDepartmentForm").addEventListener("click", () => activatePage("department-master"));

    $("#cancelDesignationForm").addEventListener("click", () => activatePage("designation-master"));

    $("#designationForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearDesignationFormError();
      const record = collectDesignationFormRecord();
      const validation = validateDesignationRecord(record);
      if (!validation.valid) {
        showDesignationFormError(validation.message);
        return;
      }

      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;

        if (mode === "api" && api) {
          if (editingDesignationId) {
            const updated = await fetch(`/api/designations/${editingDesignationId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const row = mapDbRowToDesignationRow(updated);
            const config = pageConfig["designation-master"];
            const idx = designationMasterData.findIndex(d => d.designation_id === editingDesignationId);
            if (idx >= 0) {
              designationMasterData[idx] = updated;
              config.rows[idx] = row;
            }
            showToast(`${updated.designation_name} updated.`);
          } else {
            const created = await api.designations.create(record);
            const row = mapDbRowToDesignationRow(created);
            const config = pageConfig["designation-master"];
            designationMasterData.push(created);
            config.rows.push(row);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Yes").length);
            showToast(`${created.designation_name} created.`);
          }
        } else {
          const config = pageConfig["designation-master"];
          if (editingDesignationId) {
            const idx = designationMasterData.findIndex(d => d.designation_id === editingDesignationId);
            if (idx >= 0) {
              Object.assign(designationMasterData[idx], record);
              config.rows[idx] = [
                record.designation_code || designationMasterData[idx].designation_code || "",
                record.designation_name,
                "",
                record.grade_code || "",
                record.is_keyholder_eligible === "true" ? "Yes" : "No",
                record.status || "active"
              ];
            }
            showToast(`${record.designation_name} updated.`);
          } else {
            const nextSeq = String(config.rows.length + 1).padStart(4, "0");
            const row = [
              `DGN-${nextSeq}`,
              record.designation_name,
              "",
              record.grade_code || "",
              record.is_keyholder_eligible === "true" ? "Yes" : "No",
              record.status || "active"
            ];
            config.rows.push(row);
            const recordWithCode = { ...record, designation_code: `DGN-${nextSeq}` };
            designationMasterData.push(recordWithCode);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Yes").length);
            showToast(`${record.designation_name} created.`);
          }
        }
      } catch (error) {
        showDesignationFormError(error.message || "Designation could not be saved.");
        return;
      }
      editingDesignationId = null;
      activatePage("designation-master");
      renderModule("designation-master");
    });

    $("#cancelRoleForm").addEventListener("click", () => activatePage("role-manager"));

    $("#roleForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearRoleFormError();
      const record = collectRoleFormRecord();
      const validation = validateRoleRecord(record);
      if (!validation.valid) {
        showRoleFormError(validation.message);
        return;
      }

      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;

        if (mode === "api" && api) {
          if (editingRoleId) {
            const updated = await fetch(`/api/roles/${editingRoleId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const row = mapDbRowToRoleRow(updated);
            const config = pageConfig["role-manager"];
            const idx = roleMasterData.findIndex(r => r.role_id === editingRoleId);
            if (idx >= 0) {
              roleMasterData[idx] = updated;
              config.rows[idx] = row;
            }
            showToast(`${updated.role_name} updated.`);
          } else {
            const created = await api.roles.create(record);
            const row = mapDbRowToRoleRow(created);
            const config = pageConfig["role-manager"];
            roleMasterData.push(created);
            config.rows.push(row);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[3] !== "0").length);
            showToast(`${created.role_name} created.`);
          }
        } else {
          const config = pageConfig["role-manager"];
          if (editingRoleId) {
            const idx = roleMasterData.findIndex(r => r.role_id === editingRoleId);
            if (idx >= 0) {
              Object.assign(roleMasterData[idx], record);
              config.rows[idx] = [
                record.role_code || roleMasterData[idx].role_code || "",
                record.role_name,
                record.status || "Active",
                "0"
              ];
            }
            showToast(`${record.role_name} updated.`);
          } else {
            const nextSeq = String(config.rows.length + 1).padStart(3, "0");
            const slug = record.role_name.toUpperCase().replace(/&/g, "AND").replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
            const row = [
              `${slug}_RL_${nextSeq}`,
              record.role_name,
              record.status || "Active",
              "0"
            ];
            config.rows.push(row);
            const recordWithCode = { ...record, role_code: `${slug}_RL_${nextSeq}` };
            roleMasterData.push(recordWithCode);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[3] !== "0").length);
            showToast(`${record.role_name} created.`);
          }
        }
      } catch (error) {
        showRoleFormError(error.message || "Role could not be saved.");
        return;
      }
      editingRoleId = null;
      activatePage("role-manager");
      renderModule("role-manager");
    });

    $("#rolePermissionGrid").addEventListener("change", event => {
      if (event.target.matches('input[type="checkbox"]')) {
        updateRoleJsonPreview();
      }
    });

    $("#roleViewOnly").addEventListener("click", () => {
      document.querySelectorAll("#rolePermissionGrid input[type='checkbox']").forEach(input => {
        input.checked = input.dataset.perm === "View";
      });
      updateRoleJsonPreview();
    });

    $("#roleClearAll").addEventListener("click", () => {
      document.querySelectorAll("#rolePermissionGrid input[type='checkbox']").forEach(input => {
        input.checked = false;
      });
      updateRoleJsonPreview();
    });

    $$('[data-role-perm-mode]').forEach(btn => {
      btn.addEventListener("click", () => {
        $$('[data-role-perm-mode]').forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    $$('[data-role-field="role_name"]').forEach(field => {
      field.addEventListener("input", () => {
        const codeField = $('[data-role-field="role_code"]');
        if (codeField) {
          const slug = field.value.trim().toUpperCase().replace(/&/g, "AND").replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
          codeField.value = slug ? `${slug}_RL_` : "";
        }
      });
    });

    // ---- Leave Management Cancel Buttons ----
    $("#cancelLeaveTypeForm").addEventListener("click", () => activatePage("leave-type-master"));
    $("#cancelLeavePolicyForm").addEventListener("click", () => activatePage("leave-policy"));
    $("#cancelVariantForm").addEventListener("click", () => activatePage("policy-variants"));
    $("#cancelAssignmentForm").addEventListener("click", () => activatePage("policy-assignments"));
    $("#cancelHolidayForm").addEventListener("click", () => activatePage("holiday-calendar"));
    $("#cancelLeaveRequestForm").addEventListener("click", () => activatePage("leave-requests"));
    $("#cancelAttendanceForm").addEventListener("click", () => activatePage("attendance-list"));
    $("#cancelRegularizationForm").addEventListener("click", () => activatePage("regularization"));
    $("#cancelShiftExceptionForm").addEventListener("click", () => activatePage("shift-exceptions"));
    $("#cancelCoLedgerForm").addEventListener("click", () => activatePage("co-ledger"));
    $("#cancelAttendanceReportForm").addEventListener("click", () => activatePage("attendance-reports"));

    // ---- Leave Type Form ----
    $("#leaveTypeForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-leave-type-field]").forEach(f => { record[f.dataset.leaveTypeField] = f.value.trim(); });
      if (!record.leave_code || !record.leave_name) { showToast("Leave code and name are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (editingLeaveTypeId) {
            const updated = await fetch(`/api/leave-types/${editingLeaveTypeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["leave-type-master"];
            const idx = leaveTypeData.findIndex(t => t.leave_type_id === editingLeaveTypeId);
            if (idx >= 0) {
              leaveTypeData[idx] = updated;
              config.rows[idx] = mapDbRowToLeaveTypeRow(updated);
            }
            showToast(`${updated.leave_name} updated.`);
          } else {
            const created = await api.leaveTypes.create(record);
            const config = pageConfig["leave-type-master"];
            leaveTypeData.push(created);
            config.rows.push(mapDbRowToLeaveTypeRow(created));
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[2] === "Yes").length);
            showToast(`${created.leave_name} created.`);
          }
        } else {
          const config = pageConfig["leave-type-master"];
          if (editingLeaveTypeId) {
            const idx = leaveTypeData.findIndex(t => t.leave_type_id === editingLeaveTypeId);
            if (idx >= 0) {
              Object.assign(leaveTypeData[idx], record);
              config.rows[idx] = [record.leave_code, record.leave_name, record.is_paid === "true" ? "Yes" : "No", record.accrual_type || "none", record.status || "active"];
            }
            showToast(`${record.leave_name} updated.`);
          } else {
            config.rows.push([record.leave_code, record.leave_name, record.is_paid === "true" ? "Yes" : "No", record.accrual_type || "none", "active"]);
            config.values[0] = String(config.rows.length);
            showToast(`${record.leave_name} created.`);
          }
        }
        editingLeaveTypeId = null;
        activatePage("leave-type-master"); renderModule("leave-type-master");
      } catch (error) { showToast(error.message || "Could not save leave type.", "error"); }
    });

    // ---- Leave Policy Form ----
    $("#leavePolicyForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-leave-policy-field]").forEach(f => { record[f.dataset.leavePolicyField] = f.value.trim(); });
      if (!record.policy_name) { showToast("Policy name is required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (editingLeavePolicyId) {
            const updated = await fetch(`/api/leave-policies/${editingLeavePolicyId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["leave-policy"];
            const idx = leavePolicyData.findIndex(p => p.policy_id === editingLeavePolicyId);
            if (idx >= 0) {
              leavePolicyData[idx] = updated;
              config.rows[idx] = mapDbRowToLeavePolicyRow(updated);
            }
            showToast(`${updated.policy_name} updated.`);
          } else {
            const created = await api.leavePolicies.create(record);
            const config = pageConfig["leave-policy"];
            leavePolicyData.push(created);
            config.rows.push(mapDbRowToLeavePolicyRow(created));
            config.values[0] = String(config.rows.length);
            showToast(`${created.policy_name} created.`);
          }
        } else {
          const config = pageConfig["leave-policy"];
          if (editingLeavePolicyId) {
            const idx = leavePolicyData.findIndex(p => p.policy_id === editingLeavePolicyId);
            if (idx >= 0) {
              Object.assign(leavePolicyData[idx], record);
              config.rows[idx] = [record.policy_code || `LP-${idx + 1}`, record.policy_name, String(record.policy_year || "2026"), "1", record.status || "active"];
            }
            showToast(`${record.policy_name} updated.`);
          } else {
            const nextSeq = String(config.rows.length + 1).padStart(3, "0");
            config.rows.push([`LP-${nextSeq}`, record.policy_name, String(record.policy_year || "2026"), "1", "active"]);
            config.values[0] = String(config.rows.length);
            showToast(`${record.policy_name} created.`);
          }
        }
        editingLeavePolicyId = null;
        activatePage("leave-policy"); renderModule("leave-policy");
      } catch (error) { showToast(error.message || "Could not save policy.", "error"); }
    });

    // ---- Policy Variant Form ----
    $("#policyVariantForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-variant-field]").forEach(f => { record[f.dataset.variantField] = f.value.trim(); });
      if (!record.variant_name || !record.policy_id) { showToast("Variant name and policy are required.", "error"); return; }
      try {
        if (record.leave_entitlements) {
          try { JSON.parse(record.leave_entitlements); } catch { showToast("Invalid JSON in entitlements.", "error"); return; }
        }
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          const created = await api.policyVariants.create(record);
          const config = pageConfig["policy-variants"];
          config.rows.push(mapDbRowToPolicyVariantRow(created));
          config.values[0] = String(config.rows.length);
          showToast(`${created.variant_name} created.`);
        } else {
          const config = pageConfig["policy-variants"];
          const nextSeq = String(config.rows.length + 1).padStart(3, "0");
          config.rows.push([`VRT-${nextSeq}`, record.variant_name, record.applicable_to || "all", "0", "active"]);
          config.values[0] = String(config.rows.length);
          showToast(`${record.variant_name} created.`);
        }
        activatePage("policy-variants"); renderModule("policy-variants");
      } catch (error) { showToast(error.message || "Could not save variant.", "error"); }
    });

    // ---- Policy Assignment Form ----
    $("#policyAssignmentForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-assignment-field]").forEach(f => { record[f.dataset.assignmentField] = f.value.trim(); });
      if (!record.policy_id || !record.variant_id || !record.assignment_level) { showToast("Policy, variant, and level are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          const created = await api.policyAssignments.create(record);
          const config = pageConfig["policy-assignments"];
          config.rows.push(mapDbRowToPolicyAssignmentRow(created));
          config.values[0] = String(config.rows.length);
          showToast(`Assignment created.`);
        } else {
          const config = pageConfig["policy-assignments"];
          config.rows.push([String(config.rows.length + 1), record.assignment_level, record.variant_id, "All", "active"]);
          config.values[0] = String(config.rows.length);
          showToast(`Assignment created.`);
        }
        activatePage("policy-assignments"); renderModule("policy-assignments");
      } catch (error) { showToast(error.message || "Could not save assignment.", "error"); }
    });

    // ---- Holiday Calendar Form ----
    $("#holidayCalendarForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-holiday-field]").forEach(f => { record[f.dataset.holidayField] = f.value.trim(); });
      if (!record.holiday_name || !record.holiday_date) { showToast("Holiday name and date are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          const created = await api.holidayCalendar.create(record);
          const config = pageConfig["holiday-calendar"];
          config.rows.push(mapDbRowToHolidayRow(created));
          config.values[0] = String(config.rows.length);
          showToast(`${created.holiday_name} added.`);
        } else {
          const config = pageConfig["holiday-calendar"];
          config.rows.push([record.holiday_date, record.holiday_name, record.state_code || "WB", record.is_closed === "true" ? "Closed" : "Open", record.co_eligible === "true" ? "Yes" : "No"]);
          config.values[0] = String(config.rows.length);
          showToast(`${record.holiday_name} added.`);
        }
        activatePage("holiday-calendar"); renderModule("holiday-calendar");
      } catch (error) { showToast(error.message || "Could not save holiday.", "error"); }
    });

    // ---- Leave Request Form ----
    $("#leaveRequestForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-leave-request-field]").forEach(f => { record[f.dataset.leaveRequestField] = f.value.trim(); });
      if (!record.employee_id || !record.leave_type_id || !record.start_date || !record.end_date) { showToast("Employee, leave type, start and end dates are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          const created = await api.leaveRequests.create(record);
          const config = pageConfig["leave-requests"];
          config.rows.push(mapDbRowToLeaveRequestRow(created));
          config.values[0] = String(config.rows.length);
          showToast(`Leave request submitted.`);
        } else {
          const config = pageConfig["leave-requests"];
          const nextSeq = String(config.rows.length + 1).padStart(3, "0");
          config.rows.push([`LR-${nextSeq}`, `Emp ${record.employee_id}`, record.leave_type_id, `${record.start_date} to ${record.end_date}`, "pending"]);
          config.values[0] = String(config.rows.length);
          showToast(`Leave request submitted.`);
        }
        activatePage("leave-requests"); renderModule("leave-requests");
      } catch (error) { showToast(error.message || "Could not submit leave request.", "error"); }
    });

    // Add change event to auto-calculate duration on leave request form
    const lrStartDate = $('[data-leave-request-field="start_date"]');
    const lrEndDate = $('[data-leave-request-field="end_date"]');
    const lrDuration = $('[data-leave-request-field="duration_days"]');
    if (lrStartDate && lrEndDate && lrDuration) {
      const calcDuration = () => {
        if (lrStartDate.value && lrEndDate.value) {
          const s = new Date(lrStartDate.value);
          const e = new Date(lrEndDate.value);
          if (e >= s) { lrDuration.value = Math.round((e - s) / (86400000)) + 1; }
        }
      };
      lrStartDate.addEventListener("change", calcDuration);
      lrEndDate.addEventListener("change", calcDuration);
    }

    // ---- Attendance Form ----
    const attendanceLocEl = $("#attendanceLocation");
    const attendanceEmpEl = $("#attendanceEmployee");
    if (attendanceLocEl) {
      attendanceLocEl.addEventListener("change", function () {
        populateEmployeeDropdown(attendanceEmpEl, this.value || null);
      });
    }
    $("#attendanceForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-attendance-field]").forEach(f => { record[f.dataset.attendanceField] = f.value.trim(); });
      if (!record.employee_id || !record.attendance_date) { showToast("Employee and date are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (record.check_in && record.check_out && !record.total_hours) {
            const [ih, im] = record.check_in.split(":").map(Number);
            const [oh, om] = record.check_out.split(":").map(Number);
            record.total_hours = String(Math.round((oh * 60 + om - ih * 60 - im) / 60 * 10) / 10);
          }
          if (record.total_hours && Number(record.total_hours) < 0) record.total_hours = "0";
          if (editingAttendanceId) {
            const updated = await fetch(`/api/attendance/${editingAttendanceId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["attendance-list"];
            const idx = attendanceData.findIndex(a => a.id === editingAttendanceId);
            if (idx >= 0) {
              attendanceData[idx] = updated;
              config.rows[idx] = mapDbRowToAttendanceRow(updated);
            }
            const dashIdx = attendanceRecords.findIndex(a => String(a.id) === String(editingAttendanceId));
            if (dashIdx >= 0) {
              Object.assign(attendanceRecords[dashIdx], { status: updated.status || record.status || "Present" });
            }
            updatePresentTodayKPI();
            showToast(`Attendance record updated.`);
          } else {
            const created = await api.attendance.create(record);
            const config = pageConfig["attendance-list"];
            attendanceData.unshift(created);
            config.rows.unshift(mapDbRowToAttendanceRow(created));
            config.values[0] = String(config.rows.filter(r => r[4] === "Present").length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Late").length);
            config.values[2] = String(config.rows.filter(r => r[4] === "Absent").length);
            updatePresentTodayKPI();
            showToast(`Attendance record saved.`);
          }
        } else {
          const config = pageConfig["attendance-list"];
          const name = $(`#attendanceEmployee option[value="${record.employee_id}"]`)?.textContent || `Emp ${record.employee_id}`;
          const locName = $(`#attendanceLocation option[value="${record.location_id}"]`)?.textContent || "";
          if (editingAttendanceId) {
            const idx = attendanceData.findIndex(a => a.id === editingAttendanceId);
            if (idx >= 0) {
              Object.assign(attendanceData[idx], record);
              config.rows[idx] = [name, locName, "", record.total_hours ? `${record.total_hours}h` : "-", record.status || "Present"];
            }
            const dashIdx = attendanceRecords.findIndex(a => String(a.id) === String(editingAttendanceId));
            if (dashIdx >= 0) {
              attendanceRecords[dashIdx].status = record.status || "Present";
            }
            updatePresentTodayKPI();
            showToast(`Attendance record updated.`);
          } else {
            config.rows.unshift([name, locName, "", record.total_hours ? `${record.total_hours}h` : "-", record.status || "Present"]);
            config.values[0] = String(config.rows.filter(r => r[4] === "Present").length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Late").length);
            config.values[2] = String(config.rows.filter(r => r[4] === "Absent").length);
            const initials = (name || "").split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2) || "NA";
            attendanceRecords.unshift({
              id: record.employee_id + "-" + (record.attendance_date || Date.now()),
              name,
              initials,
              location: locName,
              shift: "",
              checkIn: record.check_in || "",
              checkOut: record.check_out || "",
              status: record.status || "Present"
            });
            updatePresentTodayKPI();
            showToast(`Attendance record saved.`);
          }
        }
        editingAttendanceId = null;
        activatePage("attendance-list"); renderModule("attendance-list");
      } catch (error) { showToast(error.message || "Could not save attendance.", "error"); }
    });

    // ---- Regularization Form ----
    $("#regularizationForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-reg-field]").forEach(f => { record[f.dataset.regField] = f.value.trim(); });
      if (!record.employee_id || !record.attendance_date || !record.issue_type) { showToast("Employee, date and issue type are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (editingRegularizationId) {
            const updated = await fetch(`/api/regularization/${editingRegularizationId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["regularization"];
            const idx = regularizationData.findIndex(r => r.request_id === editingRegularizationId);
            if (idx >= 0) {
              regularizationData[idx] = updated;
              config.rows[idx] = mapDbRowToRegularizationRow(updated);
            }
            showToast(`Regularization request updated.`);
          } else {
            const created = await api.regularization.create(record);
            const config = pageConfig["regularization"];
            regularizationData.unshift(created);
            config.rows.unshift(mapDbRowToRegularizationRow(created));
            config.values[0] = String(config.rows.filter(r => r[4] === "Pending").length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Approved").length);
            config.values[2] = String(config.rows.filter(r => r[4] === "Rejected").length);
            showToast(`Regularization request submitted.`);
          }
        } else {
          const config = pageConfig["regularization"];
          const name = $(`#regEmployee option[value="${record.employee_id}"]`)?.textContent || `Emp ${record.employee_id}`;
          if (editingRegularizationId) {
            const idx = regularizationData.findIndex(r => r.request_id === editingRegularizationId);
            if (idx >= 0) {
              Object.assign(regularizationData[idx], record);
              config.rows[idx] = [`RR-${editingRegularizationId}`, name, (record.issue_type || "").replace(/_/g, " "), record.attendance_date || "", record.status || "Pending"];
            }
            showToast(`Regularization request updated.`);
          } else {
            config.rows.unshift([`RR-${Date.now()}`, name, (record.issue_type || "").replace(/_/g, " "), record.attendance_date || "", "Pending"]);
            config.values[0] = String(config.rows.filter(r => r[4] === "Pending").length);
            showToast(`Regularization request submitted.`);
          }
        }
        editingRegularizationId = null;
        activatePage("regularization"); renderModule("regularization");
      } catch (error) { showToast(error.message || "Could not submit request.", "error"); }
    });

    // ---- Shift Exception Form ----
    $("#shiftExceptionForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-exc-field]").forEach(f => { record[f.dataset.excField] = f.value.trim(); });
      if (!record.employee_id || !record.exception_date || !record.exception_type) { showToast("Employee, date and exception type are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (editingShiftExceptionId) {
            const updated = await fetch(`/api/shift-exceptions/${editingShiftExceptionId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["shift-exceptions"];
            const idx = shiftExceptionData.findIndex(e => e.exception_id === editingShiftExceptionId);
            if (idx >= 0) {
              shiftExceptionData[idx] = updated;
              config.rows[idx] = mapDbRowToShiftExceptionRow(updated);
            }
            showToast(`Shift exception updated.`);
          } else {
            const created = await api.shiftExceptions.create(record);
            const config = pageConfig["shift-exceptions"];
            shiftExceptionData.unshift(created);
            config.rows.unshift(mapDbRowToShiftExceptionRow(created));
            config.values[0] = String(config.rows.filter(r => r[4] === "Open").length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Critical").length);
            config.values[2] = String(config.rows.filter(r => r[4] === "Resolved").length);
            showToast(`Shift exception saved.`);
          }
        } else {
          const config = pageConfig["shift-exceptions"];
          const name = $(`#excEmployee option[value="${record.employee_id}"]`)?.textContent || `Emp ${record.employee_id}`;
          if (editingShiftExceptionId) {
            const idx = shiftExceptionData.findIndex(e => e.exception_id === editingShiftExceptionId);
            if (idx >= 0) {
              Object.assign(shiftExceptionData[idx], record);
              config.rows[idx] = [name, (record.exception_type || "").replace(/_/g, " "), "", record.exception_date || "", record.severity || "Open"];
            }
            showToast(`Shift exception updated.`);
          } else {
            config.rows.unshift([name, (record.exception_type || "").replace(/_/g, " "), "", record.exception_date || "", record.severity || "Open"]);
            config.values[0] = String(config.rows.filter(r => r[4] === "Open").length);
            showToast(`Shift exception saved.`);
          }
        }
        editingShiftExceptionId = null;
        activatePage("shift-exceptions"); renderModule("shift-exceptions");
      } catch (error) { showToast(error.message || "Could not save exception.", "error"); }
    });

    // ---- CO Ledger Form ----
    $("#coLedgerForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-co-field]").forEach(f => { record[f.dataset.coField] = f.value.trim(); });
      if (!record.employee_id || !record.entry_type || !record.units) { showToast("Employee, entry type and units are required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          if (editingCoLedgerId) {
            const updated = await fetch(`/api/co-ledger/${editingCoLedgerId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const config = pageConfig["co-ledger"];
            const idx = coLedgerData.findIndex(c => c.entry_id === editingCoLedgerId);
            if (idx >= 0) {
              coLedgerData[idx] = updated;
              config.rows[idx] = mapDbRowToCoLedgerRow(updated);
            }
            showToast(`CO entry updated.`);
          } else {
            const created = await api.coLedger.create(record);
            const config = pageConfig["co-ledger"];
            coLedgerData.unshift(created);
            config.rows.unshift(mapDbRowToCoLedgerRow(created));
            config.values[0] = String(config.rows.filter(r => r[4] === "Available").length);
            config.values[2] = String(config.rows.filter(r => r[4] === "Expired").length);
            showToast(`CO entry saved.`);
          }
        } else {
          const config = pageConfig["co-ledger"];
          const name = $(`#coEmployee option[value="${record.employee_id}"]`)?.textContent || `Emp ${record.employee_id}`;
          if (editingCoLedgerId) {
            const idx = coLedgerData.findIndex(c => c.entry_id === editingCoLedgerId);
            if (idx >= 0) {
              Object.assign(coLedgerData[idx], record);
              config.rows[idx] = [name, record.entry_type, record.units, record.expiry_date || "-", "Available"];
            }
            showToast(`CO entry updated.`);
          } else {
            config.rows.unshift([name, record.entry_type, record.units, record.expiry_date || "-", "Available"]);
            config.values[0] = String(config.rows.filter(r => r[4] === "Available").length);
            showToast(`CO entry saved.`);
          }
        }
        editingCoLedgerId = null;
        activatePage("co-ledger"); renderModule("co-ledger");
      } catch (error) { showToast(error.message || "Could not save CO entry.", "error"); }
    });

    // ---- Attendance Report Form ----
    $("#attendanceReportForm").addEventListener("submit", async event => {
      event.preventDefault();
      const record = {};
      $$("[data-report-field]").forEach(f => { record[f.dataset.reportField] = f.value.trim(); });
      if (!record.report_name) { showToast("Report name is required.", "error"); return; }
      try {
        const api = window.IndipetHRMS?.api; const mode = window.IndipetHRMS?.dataMode;
        if (mode === "api" && api) {
          const created = await api.attendanceReports.create(record);
          const config = pageConfig["attendance-reports"];
          config.rows.unshift(mapDbRowToAttendanceReportRow(created));
          config.values[0] = String(config.rows.length);
          showToast(`Report saved.`);
        } else {
          const config = pageConfig["attendance-reports"];
          config.rows.unshift([record.report_name, record.scope || "All", record.period_start && record.period_end ? `${record.period_start} to ${record.period_end}` : "Custom", "Admin", "Draft"]);
          config.values[0] = String(config.rows.length);
          showToast(`Report saved.`);
        }
        activatePage("attendance-reports"); renderModule("attendance-reports");
      } catch (error) { showToast(error.message || "Could not save report.", "error"); }
    });

    $("#departmentForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearDepartmentFormError();
      const record = collectDepartmentFormRecord();
      const validation = validateDepartmentRecord(record);
      if (!validation.valid) {
        showDepartmentFormError(validation.message);
        return;
      }

      try {
        const api = window.IndipetHRMS?.api;
        const mode = window.IndipetHRMS?.dataMode;

        if (mode === "api" && api) {
          if (editingDepartmentId) {
            const updated = await fetch(`/api/departments/${editingDepartmentId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record)
            }).then(r => r.ok ? r.json() : Promise.reject(new Error("Update failed")));
            const row = mapDbRowToDepartmentRow(updated);
            const config = pageConfig["department-master"];
            const idx = departmentMasterData.findIndex(d => d.department_id === editingDepartmentId);
            if (idx >= 0) {
              departmentMasterData[idx] = updated;
              config.rows[idx] = row;
            }
            showToast(`${updated.department_name} updated.`);
          } else {
            const created = await api.departments.create(record);
            const row = mapDbRowToDepartmentRow(created);
            const config = pageConfig["department-master"];
            departmentMasterData.push(created);
            config.rows.push(row);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Yes").length);
            showToast(`${created.department_name} created.`);
          }
        } else {
          const config = pageConfig["department-master"];
          if (editingDepartmentId) {
            const idx = departmentMasterData.findIndex(d => d.department_id === editingDepartmentId);
            if (idx >= 0) {
              Object.assign(departmentMasterData[idx], record);
              config.rows[idx] = [
                record.department_code || departmentMasterData[idx].department_code || "",
                record.department_name,
                record.department_short_code,
                record.revenue_centre_code || "",
                record.is_revenue_generating === "true" ? "Yes" : "No",
                record.status || "active"
              ];
            }
            showToast(`${record.department_name} updated.`);
          } else {
            const shortCode = record.department_short_code.toUpperCase();
            const nextSeq = String(config.rows.length + 1).padStart(3, "0");
            const row = [
              `${shortCode}-${nextSeq}`,
              record.department_name,
              shortCode,
              `RC-${shortCode}-${nextSeq}`,
              record.is_revenue_generating === "true" ? "Yes" : "No",
              record.status || "active"
            ];
            config.rows.push(row);
            const recordWithId = { ...record, department_code: `${shortCode}-${nextSeq}` };
            departmentMasterData.push(recordWithId);
            config.values[0] = String(config.rows.length);
            config.values[1] = String(config.rows.filter(r => r[4] === "Yes").length);
            showToast(`${record.department_name} created.`);
          }
        }
      } catch (error) {
        showDepartmentFormError(error.message || "Department could not be saved.");
        return;
      }
      editingDepartmentId = null;
      activatePage("department-master");
      renderModule("department-master");
    });

    $("#cancelEntityForm").addEventListener("click", () => activatePage("entity-master"));
    $("#backEntityStep").addEventListener("click", () => setEntityStep(activeEntityStep - 1));
    $("#nextEntityStep").addEventListener("click", () => setEntityStep(activeEntityStep + 1));
    $("#entityStepper").addEventListener("click", event => {
      const step = event.target.closest("[data-entity-step]");
      if (!step) return;
      setEntityStep(Number(step.dataset.entityStep));
    });
    $$("[data-entity-field], [data-entity-access-field]").forEach(field => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
        $("#entityFormError").classList.remove("is-visible");
      });
      field.addEventListener("change", () => {
        field.removeAttribute("aria-invalid");
        if (field.dataset.entityField === "entity_role") updateEntityAccessState();
      });
    });
    $("#entityForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearEntityFormError();
      const record = collectEntityFormRecord();
      const validation = validateEntityRecord(record);
      if (!validation.valid) {
        const firstInvalid = validation.fields[0]?.closest(".entity-form-section");
        if (firstInvalid) setEntityStep(Number(firstInvalid.dataset.entitySection));
        showEntityFormError(validation.message, validation.fields);
        return;
      }
      const accessValidation = validateEntityAccess();
      if (!accessValidation.valid) {
        const firstInvalid = accessValidation.fields[0]?.closest(".entity-form-section");
        if (firstInvalid) setEntityStep(Number(firstInvalid.dataset.entitySection));
        showEntityFormError(accessValidation.message, accessValidation.fields);
        return;
      }
      try {
        await createEntityRecord(record);
      } catch (error) {
        showEntityFormError("The entity could not be created. Review the entered values and try again.");
      }
    });

    $("#cancelEmployeeForm").addEventListener("click", () => activatePage("employee-master"));
    $("#backEmployeeStep").addEventListener("click", () => setEmployeeStep(activeEmployeeStep - 1));
    $("#nextEmployeeStep").addEventListener("click", () => setEmployeeStep(activeEmployeeStep + 1));
    $("#employeeStepper").addEventListener("click", event => {
      const step = event.target.closest("[data-employee-step]");
      if (!step) return;
      setEmployeeStep(Number(step.dataset.employeeStep));
    });
    $$("[data-employee-field]").forEach(field => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
        $("#employeeFormError").classList.remove("is-visible");
        updateEmployeeReadiness();
      });
      field.addEventListener("change", () => {
        field.removeAttribute("aria-invalid");
        $("#employeeFormError").classList.remove("is-visible");
        if (field.dataset.employeeField === "location_id") renderEmployeePreferredShiftOptions();
        updateEmployeeReadiness();
      });
    });
    $("#saveEmployeeDraft").addEventListener("click", async () => {
      clearEmployeeFormError();
      const record = collectEmployeeRecord();
      if (!record.first_name && !record.last_name) {
        showEmployeeFormError("Enter at least the employee name before saving a draft.", [
          $('[data-employee-field="first_name"]'),
          $('[data-employee-field="last_name"]')
        ]);
        return;
      }
      try {
        await createEmployeeRecord({ ...record, status: "Draft" }, true);
      } catch (error) {
        showEmployeeFormError(error.message || "Draft could not be saved.");
      }
    });
    $("#employeeForm").addEventListener("submit", async event => {
      event.preventDefault();
      clearEmployeeFormError();
      const record = collectEmployeeRecord();
      const validation = validateEmployeeForm(record);
      if (!validation.valid) {
        const firstInvalid = validation.fields[0]?.closest("[data-employee-section]");
        if (firstInvalid) setEmployeeStep(Number(firstInvalid.dataset.employeeSection));
        showEmployeeFormError(validation.message, validation.fields);
        return;
      }
      try {
        await createEmployeeRecord(record);
      } catch (error) {
        showEmployeeFormError(error.message || "The employee could not be created. Review the entered values and try again.");
      }
    });

    $("#globalSearch").addEventListener("keydown", event => {
      if (event.key === "Enter") {
        const value = event.target.value.trim();
        if (value) showToast(`Searching HRMS for "${value}".`);
      }
    });

    document.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        $("#globalSearch").focus();
      }
      if (event.key === "Escape") {
        closeModal();
        closeDrawer();
        closeMobileMenu();
        $$(".row-menu").forEach(menu => menu.classList.remove("is-open"));
      }
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".row-menu-wrap")) {
        $$(".row-menu").forEach(menu => menu.classList.remove("is-open"));
      }
    });

    function mapDbLocationToSubLocation(dbRow) {
      const entityCode = dbRow.parent_entity_code || "";
      const entityName = dbRow.parent_entity_name || dbRow.parent_entity_id || "";
      return {
        id: dbRow.location_code || String(dbRow.location_id),
        dbId: dbRow.location_id,
        name: dbRow.brand_flag || dbRow.location_name,
        listName: dbRow.location_name,
        parent: entityName,
        parentCode: entityCode,
        state: dbRow.state || "Not set",
        type: locationTypeLabel(dbRow.location_type),
        status: titleCaseValue(dbRow.status),
        readiness: 20,
        readinessLabel: titleCaseValue(dbRow.onboarding_status),
        readinessTone: "attention",
        officialHours: "Not configured",
        operationalHours: "Not configured",
        closedDay: null,
        hoursConfigured: false,
        services: [],
        deliveryZones: [],
        shifts: [],
        record: { ...dbRow }
      };
    }

    function updatePresentTodayKPI() {
      const listRows = pageConfig["attendance-list"]?.rows || [];
      if (attendanceRecords.length < listRows.length) {
        listRows.forEach((row, i) => {
          if (!attendanceRecords.some(r => r.name === row[0] && r.location === row[1])) {
            const name = row[0] || "";
            const initials = name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2) || "NA";
            attendanceRecords.push({
              id: `att-${i}-${Date.now()}`,
              name,
              initials,
              location: row[1] || "",
              shift: row[2] || "",
              checkIn: "",
              checkOut: "",
              status: row[4] || "Present"
            });
          }
        });
      }
      const presentCount = attendanceRecords.filter(r => r.status === "Present" || r.status?.toLowerCase() === "exit").length;
      const totalActive = attendanceRecords.length;
      const el = id => document.getElementById(id);
      if (el("kpiPresentValue")) el("kpiPresentValue").textContent = String(presentCount);
      if (el("kpiPresentTrend")) el("kpiPresentTrend").textContent = `of ${totalActive} active`;
    }

    (async function bootstrap() {
      const api = window.IndipetHRMS?.api;
      const mode = window.IndipetHRMS?.dataMode;

      if (mode === "api" && api) {
        try {
          const [entities, dashboard] = await Promise.all([
            api.entities.list(),
            fetch("/api/dashboard").then(r => r.ok ? r.json() : null)
          ]);

          parentEntities = {};
          entities.forEach(e => {
            parentEntities[e.entity_code || String(e.entity_id)] = e.legal_name;
          });
          entityMasterData = entities;

          const entityConfig = pageConfig["entity-master"];
          entityConfig.rows = entities.map(e => [
            e.entity_code || String(e.entity_id),
            e.legal_name,
            e.entity_type ? e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1) : "",
            e.entity_role ? e.entity_role.charAt(0).toUpperCase() + e.entity_role.slice(1) : "",
            e.status
          ]);
          entityConfig.values = [
            String(entities.length),
            String(entities.filter(e => e.entity_role === "franchisee").length),
            String(subLocations.length)
          ];

          if (dashboard) {
            const el = id => document.getElementById(id);
            if (el("kpiWorkforceValue")) el("kpiWorkforceValue").textContent = dashboard.activeWorkforce;
            if (el("kpiWorkforceTrend")) el("kpiWorkforceTrend").textContent = `${dashboard.activeEntities} entities`;
            if (el("kpiPresentValue")) el("kpiPresentValue").textContent = dashboard.presentToday ?? "0";
            if (el("kpiPresentTrend")) el("kpiPresentTrend").textContent = `of ${dashboard.totalActive ?? 0} active`;
            if (el("kpiApprovalsValue")) el("kpiApprovalsValue").textContent = dashboard.pendingApprovals ?? "0";
            if (el("kpiApprovalsTrend")) el("kpiApprovalsTrend").textContent = "pending";
            if (el("kpiRosterValue")) el("kpiRosterValue").textContent = dashboard.rosterCoverage ?? "--";
            if (el("kpiRosterTrend")) el("kpiRosterTrend").textContent = "filled";
            if (dashboard.weeklyData) {
              weeklyData.splice(0, weeklyData.length, ...dashboard.weeklyData);
            }
          }

          const locations = await api.locations.list();
          subLocations.length = 0;
          locations.forEach(dbLoc => {
            const location = mapDbLocationToSubLocation(dbLoc);
            subLocations.push(location);
          });
          entityConfig.values[2] = String(subLocations.length);

          await Promise.all(subLocations.map(async (location) => {
            try {
              const policies = await api.shiftPolicies.list({ location_id: location.dbId });
              if (Array.isArray(policies) && policies.length) {
                location.shifts = policies.map(p => [
                  p.policy_id,
                  p.policy_name,
                  p.shift_type,
                  String(p.sanctioned_strength || 1),
                  p.weekly_off_pattern || "Rotational",
                  p.policy_status || "Active",
                  p.coverage_mode || "Standard",
                  p.shift_start_time || "00:00",
                  p.shift_end_time || "00:00",
                  p.total_shift_hours || 0,
                  p.break_duration_minutes || 0,
                  p.net_work_hours || 0,
                  p.max_leave_per_day || 1,
                  p.keyholder_required === true ? "Yes" : "No",
                  p.max_consecutive_days || 6,
                ]);
              }
            } catch (err) {
              console.warn(`Failed to load shift policies for ${location.listName}:`, err);
            }
          }));

          const departments = await api.departments.list();
          departmentMasterData = departments;
          const deptConfig = pageConfig["department-master"];
          deptConfig.rows = departments.map(d => mapDbRowToDepartmentRow(d));
          deptConfig.values[0] = String(deptConfig.rows.length);
          deptConfig.values[1] = String(deptConfig.rows.filter(r => r[4] === "Yes").length);

          const designations = await api.designations.list();
          designationMasterData = designations;
          const desigConfig = pageConfig["designation-master"];
          desigConfig.rows = designations.map(d => mapDbRowToDesignationRow(d));
          desigConfig.values[0] = String(desigConfig.rows.length);
          desigConfig.values[1] = String(desigConfig.rows.filter(r => r[4] === "Yes").length);

          const roles = await api.roles.list();
          roleMasterData = roles;
          const roleConfig = pageConfig["role-manager"];
          roleConfig.rows = roles.map(r => mapDbRowToRoleRow(r));
          roleConfig.values[0] = String(roleConfig.rows.length);
          roleConfig.values[1] = String(roleConfig.rows.filter(r => r[3] !== "0").length);

          const employees = await api.employees.list();
          const empConfig = pageConfig["employee-master"];
          empConfig.rows = employees.map(e => mapDbRowToEmployeeRow(e));
          employeeMasterData = employees;
          empConfig.values = [
            String(empConfig.rows.length),
            String(empConfig.rows.filter(r => r[4] === "Complete").length),
            String(empConfig.rows.filter(r => r[4] !== "Complete").length)
          ];

          const [leaveTypes, leavePolicies, variants, assignments, holidays, lRequests] = await Promise.all([
            api.leaveTypes.list().catch(() => []),
            api.leavePolicies.list().catch(() => []),
            api.policyVariants.list().catch(() => []),
            api.policyAssignments.list().catch(() => []),
            api.holidayCalendar.list().catch(() => []),
            api.leaveRequests.list().catch(() => []),
          ]);
          leaveTypeData = leaveTypes;
          leavePolicyData = leavePolicies;
          leaveRequestData = lRequests;
          pageConfig["leave-type-master"].rows = leaveTypes.map(mapDbRowToLeaveTypeRow);
          pageConfig["leave-type-master"].values[0] = String(leaveTypes.length);
          pageConfig["leave-type-master"].values[1] = String(leaveTypes.filter(t => t.is_paid).length);

          pageConfig["leave-policy"].rows = leavePolicies.map(mapDbRowToLeavePolicyRow);
          pageConfig["leave-policy"].values[0] = String(leavePolicies.length);

          pageConfig["policy-variants"].rows = variants.map(mapDbRowToPolicyVariantRow);
          pageConfig["policy-variants"].values[0] = String(variants.length);

          pageConfig["policy-assignments"].rows = assignments.map(mapDbRowToPolicyAssignmentRow);
          pageConfig["policy-assignments"].values[0] = String(assignments.length);

          pageConfig["holiday-calendar"].rows = holidays.map(mapDbRowToHolidayRow);
          pageConfig["holiday-calendar"].values[0] = String(holidays.length);

          pageConfig["leave-requests"].rows = lRequests.map(mapDbRowToLeaveRequestRow);
          pageConfig["leave-requests"].values[0] = String(lRequests.length);

          const [dashData, attendanceRows, regRows, excRows, coRows, reportRows] = await Promise.all([
            api.attendance.dashboard().catch(() => null),
            api.attendance.list().catch(() => []),
            api.regularization.list().catch(() => []),
            api.shiftExceptions.list().catch(() => []),
            api.coLedger.list().catch(() => []),
            api.attendanceReports.list().catch(() => []),
          ]);

          if (dashData) {
            attendanceRecords.splice(0, attendanceRecords.length, ...(dashData.records || []));
            updatePresentTodayKPI();
          }

          attendanceData = attendanceRows;
          const attConfig = pageConfig["attendance-list"];
          attConfig.rows = attendanceRows.map(mapDbRowToAttendanceRow);
          attConfig.values = [
            String(attConfig.rows.filter(r => r[4] === "Present").length),
            String(attConfig.rows.filter(r => r[4] === "Late").length),
            String(attConfig.rows.filter(r => r[4] === "Absent").length),
          ];

          regularizationData = regRows;
          const regConfig = pageConfig["regularization"];
          regConfig.rows = regRows.map(mapDbRowToRegularizationRow);
          regConfig.values = [
            String(regConfig.rows.filter(r => r[4] === "Pending").length),
            String(regConfig.rows.filter(r => r[4] === "Approved").length),
            String(regConfig.rows.filter(r => r[4] === "Rejected").length),
          ];

          shiftExceptionData = excRows;
          const excConfig = pageConfig["shift-exceptions"];
          excConfig.rows = excRows.map(mapDbRowToShiftExceptionRow);
          excConfig.values = [
            String(excConfig.rows.filter(r => r[4] === "Open").length),
            String(excConfig.rows.filter(r => r[4] === "Critical").length),
            String(excConfig.rows.filter(r => r[4] === "Resolved").length),
          ];

          coLedgerData = coRows;
          const coConfig = pageConfig["co-ledger"];
          coConfig.rows = coRows.map(mapDbRowToCoLedgerRow);
          coConfig.values = [
            String(coConfig.rows.filter(r => r[4] === "Available").length),
            "0",
            String(coConfig.rows.filter(r => r[4] === "Expired").length),
          ];

          const reportConfig = pageConfig["attendance-reports"];
          reportConfig.rows = reportRows.map(mapDbRowToAttendanceReportRow);
          reportConfig.values = [
            String(reportConfig.rows.length),
            "0",
            "0",
          ];
        } catch (err) {
          console.error("Bootstrap data load failed:", err);
        }
      }

      await loadParentEntityOptions();
      await loadStateOptions();
      await loadDepartmentOptions();
      await loadRoleOptions();
      await loadEntityOptions();
      await loadLeaveDropdownOptions();
      setupLocationFormEvents();
      renderWeeklyChart();
      renderAttendance();
      renderLocationControl();
      updatePresentTodayKPI();
      refreshIcons();
    })();
