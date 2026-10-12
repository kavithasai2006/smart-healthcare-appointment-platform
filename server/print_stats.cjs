const mongoose = require('mongoose');
async function reportStats() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart_healthcare');
  const Doctor = mongoose.model('Doctor', new mongoose.Schema({ locationName: String, specialization: String }, { strict: false }));
  const Location = mongoose.model('Location', new mongoose.Schema({ name: String }, { strict: false }));
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({ location: mongoose.Schema.Types.ObjectId }, { strict: false }));

  console.log('--- HOSPITALS & DOCTORS BY LOCATION ---');
  const locs = await Location.find({}).sort({ name: 1 });
  for (const loc of locs) {
    const hCount = await Hospital.countDocuments({ location: loc._id });
    const dCount = await Doctor.countDocuments({ location: loc._id });
    console.log(`  ${loc.name.padEnd(16)}: ${hCount} hospitals | ${dCount} doctors`);
  }

  console.log('\n--- DOCTORS BY SPECIALIZATION ---');
  const specs = await Doctor.aggregate([
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  for (const s of specs) {
    console.log(`  ${(s._id || 'None').padEnd(20)}: ${s.count} doctors`);
  }

  const totalHosps = await Hospital.countDocuments();
  const totalDocs = await Doctor.countDocuments();
  console.log('\nTotal Hospitals:', totalHosps);
  console.log('Total Doctors:', totalDocs);

  await mongoose.disconnect();
}
reportStats();
