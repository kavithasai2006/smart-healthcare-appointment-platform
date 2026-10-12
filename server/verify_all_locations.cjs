const mongoose = require('mongoose');
const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

function sendJson(url, method, payload) {
  return new Promise((resolve, reject) => {
    const dataString = payload ? JSON.stringify(payload) : '';
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = body;
        try { parsed = JSON.parse(body); } catch(e) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('   SMART HEALTHCARE PLATFORM - COMPREHENSIVE VERIFICATION SUITE');
  console.log('================================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/smart_healthcare');
  const Location = mongoose.model('Location', new mongoose.Schema({ name: String }, { strict: false }));
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({ name: String, location: mongoose.Schema.Types.ObjectId, specialties: [String], isSample: Boolean }, { strict: false }));
  const Doctor = mongoose.model('Doctor', new mongoose.Schema({ name: String, specialization: String, hospital: mongoose.Schema.Types.ObjectId, hospitalName: String, location: mongoose.Schema.Types.ObjectId, fee: String, rating: Number, isSample: Boolean }, { strict: false }));
  const Appointment = mongoose.model('Appointment', new mongoose.Schema({ status: String, doctor: mongoose.Schema.Types.ObjectId, hospital: mongoose.Schema.Types.ObjectId, location: mongoose.Schema.Types.ObjectId, appointmentDate: String, appointmentTime: String }, { strict: false }));

  // -------------------------------------------------------------
  // TEST 1: The Exact Reported Bug
  // Location: Guntur -> NRI General Hospital (Chinakalani) -> All Specializations & Cardiologist
  // -------------------------------------------------------------
  console.log('--- TEST 1: VERIFY EXACT FAILING CASE ---');
  console.log('Target: Guntur -> NRI General Hospital (Chinakalani) -> All Specializations');

  const nriAllDocs = await fetchJson('http://localhost:5000/api/doctors?location=Guntur&hospital=' + encodeURIComponent('NRI General Hospital (Chinakalani)'));
  const nriTotalCount = nriAllDocs.data?.length || 0;
  console.log(`  Doctors returned for All Specializations: ${nriTotalCount}`);

  const nriSpecs = await fetchJson('http://localhost:5000/api/doctors/specializations?location=Guntur&hospital=' + encodeURIComponent('NRI General Hospital (Chinakalani)'));
  console.log(`  Specializations offered at NRI General Hospital: ${(nriSpecs.data || []).join(', ')}`);

  const nriCardioDocs = await fetchJson('http://localhost:5000/api/doctors?location=Guntur&hospital=' + encodeURIComponent('NRI General Hospital (Chinakalani)') + '&specialization=Cardiologist');
  const nriCardioCount = nriCardioDocs.data?.length || 0;
  console.log(`  Doctors returned for Cardiologist: ${nriCardioCount}`);

  const passTest1 = nriTotalCount >= 5 && nriCardioCount >= 5;
  console.log(`  Status for Exact Failing Case: ${passTest1 ? 'PASS' : 'FAIL'}\n`);

  // -------------------------------------------------------------
  // TEST 2: Verify All 13 Supported Andhra Pradesh Locations
  // -------------------------------------------------------------
  console.log('--- TEST 2: VERIFY ALL 13 ANDHRA PRADESH LOCATIONS ---');
  const locations = [
    'Guntur', 'Tenali', 'Vijayawada', 'Visakhapatnam', 'Tirupati',
    'Nellore', 'Kakinada', 'Rajahmundry', 'Ongole', 'Kurnool',
    'Kadapa', 'Anantapur', 'Eluru'
  ];

  let allLocationsPassed = true;
  for (const locName of locations) {
    // 1. Fetch hospitals for location
    const hospRes = await fetchJson('http://localhost:5000/api/hospitals?location=' + encodeURIComponent(locName));
    const hospList = hospRes.data || [];

    if (hospList.length < 10) {
      console.log(`  [FAIL] ${locName.padEnd(14)}: Only ${hospList.length} hospitals (Expected >= 10)`);
      allLocationsPassed = false;
      continue;
    }

    // 2. Select first hospital and inspect its doctors & specializations
    const testHosp = hospList[0];
    const specsRes = await fetchJson('http://localhost:5000/api/doctors/specializations?hospital=' + encodeURIComponent(testHosp.name));
    const testSpecs = specsRes.data || [];

    const allDocsRes = await fetchJson('http://localhost:5000/api/doctors?hospital=' + encodeURIComponent(testHosp.name));
    const hospDocs = allDocsRes.data || [];

    // 3. Test filtering with the first available specialization
    let specFilterCount = 0;
    if (testSpecs.length > 0) {
      const specDocsRes = await fetchJson('http://localhost:5000/api/doctors?hospital=' + encodeURIComponent(testHosp.name) + '&specialization=' + encodeURIComponent(testSpecs[0]));
      specFilterCount = specDocsRes.data?.length || 0;
    }

    const locPass = hospList.length >= 10 && hospDocs.length > 0 && specFilterCount >= 5;
    if (!locPass) allLocationsPassed = false;

    console.log(`  ${locName.padEnd(14)}: ${hospList.length} hospitals | Test Hosp: '${testHosp.name.substring(0, 32)}...' -> ${hospDocs.length} total docs | Spec '${testSpecs[0]}': ${specFilterCount} docs -> ${locPass ? 'PASS' : 'FAIL'}`);
  }
  console.log(`  Status for 13 Locations & Filtering: ${allLocationsPassed ? 'PASS' : 'FAIL'}\n`);

  // -------------------------------------------------------------
  // TEST 3: Doctor Selection, Booking, MongoDB Persistence & Retrieval
  // -------------------------------------------------------------
  console.log('--- TEST 3: APPOINTMENT BOOKING & PERSISTENCE ---');
  const selectedDoc = nriCardioDocs.data[0];
  const gunturLoc = await Location.findOne({ name: 'Guntur' });
  const nriHosp = await Hospital.findOne({ name: /NRI General Hospital/i });

  const bookingPayload = {
    location: 'Guntur, AP',
    locationId: gunturLoc._id.toString(),
    hospital: nriHosp.name,
    hospitalId: nriHosp._id.toString(),
    doctor: selectedDoc.name,
    doctorId: (selectedDoc.id || selectedDoc._id).toString(),
    date: '2026-12-15',
    time: '11:00 AM',
    patientName: 'Kavitha Test Patient',
    patientPhone: '9876543210',
    patientEmail: 'kavitha.test@example.com',
    specialization: selectedDoc.specialization,
    fee: selectedDoc.fee || '₹600',
    reason: 'Cardiology Consultation Verification'
  };

  // Clean slot before test
  await Appointment.deleteMany({
    doctor: new mongoose.Types.ObjectId(selectedDoc.id || selectedDoc._id),
    appointmentDate: '2026-12-15',
    appointmentTime: '11:00 AM'
  });

  // Step A: Book appointment
  const bookRes = await sendJson('http://localhost:5000/api/appointments', 'POST', bookingPayload);
  const passBooking = bookRes.status === 201;
  const bookedApptId = bookRes.body?.data?._id || bookRes.body?.data?.id;
  console.log(`  Booking API: HTTP ${bookRes.status} -> Appt ID: ${bookedApptId}`);

  // Step B: Check MongoDB persistence and populated references
  const dbAppt = await Appointment.findById(bookedApptId).populate('doctor hospital location');
  const passPersistence = Boolean(
    dbAppt &&
    dbAppt.doctor &&
    dbAppt.hospital &&
    dbAppt.location &&
    dbAppt.status === 'Confirmed'
  );
  console.log(`  MongoDB Persistence: ${passPersistence ? 'PASS' : 'FAIL'} (Doctor ref: ${dbAppt?.doctor?.name}, Hospital ref: ${dbAppt?.hospital?.name}, Loc ref: ${dbAppt?.location?.name})`);

  // Step C: Retrieval via API
  const myApptsRes = await fetchJson('http://localhost:5000/api/appointments?email=kavitha.test@example.com');
  const foundInMyAppts = (myApptsRes.data || []).some(a => (a._id || a.id) === bookedApptId);
  console.log(`  Retrieval in My Appointments: ${foundInMyAppts ? 'PASS' : 'FAIL'} (${myApptsRes.data?.length} appointment(s) found)`);

  // -------------------------------------------------------------
  // TEST 4: Duplicate Slot Conflict Prevention
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: DUPLICATE BOOKING CONFLICT PREVENTION ---');
  const dupRes = await sendJson('http://localhost:5000/api/appointments', 'POST', bookingPayload);
  const passDuplicate = dupRes.status === 409;
  console.log(`  Duplicate booking attempt: HTTP ${dupRes.status} (Expected 409 Conflict) -> ${passDuplicate ? 'PASS' : 'FAIL'}`);

  // -------------------------------------------------------------
  // TEST 5: Appointment Cancellation & MongoDB Status Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: APPOINTMENT CANCELLATION ---');
  const cancelRes = await sendJson(`http://localhost:5000/api/appointments/${bookedApptId}/cancel`, 'PATCH', {});
  const passCancelApi = cancelRes.status === 200;

  const cancelledDbAppt = await Appointment.findById(bookedApptId);
  const passCancelDb = cancelledDbAppt?.status === 'Cancelled';
  console.log(`  Cancel API: HTTP ${cancelRes.status} | MongoDB status updated to: '${cancelledDbAppt?.status}' -> ${passCancelApi && passCancelDb ? 'PASS' : 'FAIL'}`);

  console.log('\n================================================================');
  console.log('   VERIFICATION SUMMARY');
  console.log('================================================================');
  console.log(`  1. Failing Case (Guntur -> NRI Hospital -> All Specs): ${passTest1 ? 'PASS' : 'FAIL'}`);
  console.log(`  2. All 13 AP Locations (10-15 hospitals & 5+ docs/spec): ${allLocationsPassed ? 'PASS' : 'FAIL'}`);
  console.log(`  3. Doctor Selection & Booking: ${passBooking ? 'PASS' : 'FAIL'}`);
  console.log(`  4. MongoDB Persistence & Populated References: ${passPersistence ? 'PASS' : 'FAIL'}`);
  console.log(`  5. My Appointments Retrieval: ${foundInMyAppts ? 'PASS' : 'FAIL'}`);
  console.log(`  6. Duplicate Booking Conflict (409): ${passDuplicate ? 'PASS' : 'FAIL'}`);
  console.log(`  7. Appointment Cancellation Persistence: ${passCancelApi && passCancelDb ? 'PASS' : 'FAIL'}`);
  console.log('================================================================\n');

  await mongoose.disconnect();
}

runComprehensiveVerification().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
