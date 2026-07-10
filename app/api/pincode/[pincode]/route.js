export async function GET(request, { params }) {
  try {
    const { pincode } = await params;

    if (!/^\d{6}$/.test(pincode)) {
      return Response.json({ message: "Invalid pincode format." }, { status: 400 });
    }

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return Response.json({ message: "Pincode lookup failed." }, { status: response.status });
    }

    const data = await response.json();
    const postOffice = data?.[0]?.PostOffice;

    if (!postOffice || postOffice.length === 0) {
      return Response.json({ message: "No data found for this pincode." }, { status: 404 });
    }

    const entry = postOffice[0];
    const districts = [...new Set(postOffice.map(p => p.District).filter(Boolean))];
    const state = entry.State || null;
    const stateCode = getStateCode(state);

    return Response.json({
      pincode,
      cities: districts,
      state,
      state_code: stateCode,
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      return Response.json({ message: "Pincode lookup timed out." }, { status: 504 });
    }
    return Response.json({ message: error.message }, { status: 500 });
  }
}

const STATE_CODE_MAP = {
  "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS",
  "Bihar": "BR", "Chhattisgarh": "CG", "Goa": "GA", "Gujarat": "GJ",
  "Haryana": "HR", "Himachal Pradesh": "HP", "Jharkhand": "JH",
  "Karnataka": "KA", "Kerala": "KL", "Madhya Pradesh": "MP",
  "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML",
  "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD",
  "Punjab": "PB", "Rajasthan": "RJ", "Sikkim": "SK",
  "Tamil Nadu": "TN", "Telangana": "TS", "Tripura": "TR",
  "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB",
  "Andaman and Nicobar Islands": "AN", "Chandigarh": "CH",
  "Dadra and Nagar Haveli and Daman and Diu": "DD",
  "Delhi": "DL", "Jammu and Kashmir": "JK", "Ladakh": "LA",
  "Lakshadweep": "LD", "Puducherry": "PY",
};

function getStateCode(stateName) {
  if (!stateName) return null;
  return STATE_CODE_MAP[stateName] || stateName.substring(0, 2).toUpperCase();
}
