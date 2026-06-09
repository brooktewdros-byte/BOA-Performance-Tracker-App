@echo off
cd /d "%USERPROFILE%\OneDrive\Documents\BOA-Performance-Tracker\backend"

:: Create models folder and files
mkdir models 2>nul
echo const mongoose = require('mongoose'); > models\User.js
echo const userSchema = new mongoose.Schema({ employeeId: String, fullName: String, email: String, passwordHash: String, role: String, branchId: mongoose.Schema.Types.ObjectId, districtId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now } }); >> models\User.js
echo module.exports = mongoose.model('User', userSchema); >> models\User.js

echo const mongoose = require('mongoose'); > models\Branch.js
echo const branchSchema = new mongoose.Schema({ name: String, code: String, districtId: mongoose.Schema.Types.ObjectId, isActive: { type: Boolean, default: true } }); >> models\Branch.js
echo module.exports = mongoose.model('Branch', branchSchema); >> models\Branch.js

echo const mongoose = require('mongoose'); > models\District.js
echo const districtSchema = new mongoose.Schema({ name: String, code: String, isActive: { type: Boolean, default: true } }); >> models\District.js
echo module.exports = mongoose.model('District', districtSchema); >> models\District.js

echo const mongoose = require('mongoose'); > models\KPIEntry.js
echo const kpiEntrySchema = new mongoose.Schema({ employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' }, reportingDate: Date, depositMobilization: Number, customerAcquisition: Number, schoolOnboarding: Number, digitalTransactions: Number, loanDisbursement: Number, nonInterestIncome: Number, weightedScore: { type: Number, default: 0 }, evidenceUrls: [String], status: { type: String, default: 'pending_branch' }, branchReview: Object, districtReview: Object, hoReview: Object }); >> models\KPIEntry.js
echo kpiEntrySchema.pre('save', function(next) { const weights = { depositMobilization:0.40, customerAcquisition:0.20, schoolOnboarding:0.15, digitalTransactions:0.10, loanDisbursement:0.10, nonInterestIncome:0.05 }; const maxBenchmarks = { depositMobilization:5000000, customerAcquisition:100, schoolOnboarding:20, digitalTransactions:5000, loanDisbursement:2000000, nonInterestIncome:100000 }; let score = 0; score += (this.depositMobilization/maxBenchmarks.depositMobilization)*weights.depositMobilization*100; score += (this.customerAcquisition/maxBenchmarks.customerAcquisition)*weights.customerAcquisition*100; score += (this.schoolOnboarding/maxBenchmarks.schoolOnboarding)*weights.schoolOnboarding*100; score += (this.digitalTransactions/maxBenchmarks.digitalTransactions)*weights.digitalTransactions*100; score += (this.loanDisbursement/maxBenchmarks.loanDisbursement)*weights.loanDisbursement*100; score += (this.nonInterestIncome/maxBenchmarks.nonInterestIncome)*weights.nonInterestIncome*100; this.weightedScore = Math.min(100, Math.round(score*100)/100); next(); }); >> models\KPIEntry.js
echo module.exports = mongoose.model('KPIEntry', kpiEntrySchema); >> models\KPIEntry.js

:: Create routes folder and files
mkdir routes 2>nul
echo const express = require('express'); > routes\auth.js
echo const router = express.Router(); >> routes\auth.js
echo const jwt = require('jsonwebtoken'); >> routes\auth.js
echo const bcrypt = require('bcryptjs'); >> routes\auth.js
echo const User = require('../models/User'); >> routes\auth.js
echo router.post('/login', async (req, res) => { try { const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(401).json({ error: 'Invalid credentials' }); const valid = await bcrypt.compare(req.body.password, user.passwordHash); if (!valid) return res.status(401).json({ error: 'Invalid credentials' }); const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); res.json({ token, user: { id: user._id, name: user.fullName, role: user.role } }); } catch(err) { res.status(500).json({ error: err.message }); } }); >> routes\auth.js
echo router.get('/me', async (req, res) => { try { const token = req.headers.authorization?.split(' ')[1]; if (!token) return res.status(401).json({ error: 'No token' }); const decoded = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(decoded.userId).select('-passwordHash'); res.json(user); } catch(err) { res.status(401).json({ error: 'Invalid token' }); } }); >> routes\auth.js
echo module.exports = router; >> routes\auth.js

:: Create minimal versions of other routes (to avoid errors)
echo const express = require('express'); const router = express.Router(); router.get('/', (req,res) => res.json({message: 'Entries endpoint'})); module.exports = router; > routes\entries.js
echo const express = require('express'); const router = express.Router(); router.get('/', (req,res) => res.json({message: 'Dashboard endpoint'})); module.exports = router; > routes\dashboard.js
echo const express = require('express'); const router = express.Router(); router.get('/', (req,res) => res.json({message: 'Hierarchy endpoint'})); module.exports = router; > routes\hierarchy.js
echo const express = require('express'); const router = express.Router(); router.get('/', (req,res) => res.json({message: 'MIS endpoint'})); module.exports = router; > routes\misImport.js
echo const express = require('express'); const router = express.Router(); router.get('/', (req,res) => res.json({message: 'Users endpoint'})); module.exports = router; > routes\users.js

:: Create middleware
mkdir middleware 2>nul
echo const jwt = require('jsonwebtoken'); > middleware\auth.js
echo module.exports = async (req, res, next) => { try { const token = req.headers.authorization?.split(' ')[1]; if (!token) throw new Error(); const decoded = jwt.verify(token, process.env.JWT_SECRET); req.userId = decoded.userId; next(); } catch(err) { res.status(401).json({ error: 'Unauthorized' }); } }; >> middleware\auth.js

:: Update server.js (full version)
copy /y nul server.js >nul
echo require('dotenv').config(); > server.js
echo const express = require('express'); >> server.js
echo const mongoose = require('mongoose'); >> server.js
echo const cors = require('cors'); >> server.js
echo const helmet = require('helmet'); >> server.js
echo const morgan = require('morgan'); >> server.js
echo const path = require('path'); >> server.js
echo const authRoutes = require('./routes/auth'); >> server.js
echo const userRoutes = require('./routes/users'); >> server.js
echo const entryRoutes = require('./routes/entries'); >> server.js
echo const dashboardRoutes = require('./routes/dashboard'); >> server.js
echo const hierarchyRoutes = require('./routes/hierarchy'); >> server.js
echo const misImportRoutes = require('./routes/misImport'); >> server.js
echo const app = express(); >> server.js
echo app.use(helmet()); >> server.js
echo app.use(cors()); >> server.js
echo app.use(express.json()); >> server.js
echo app.use(morgan('combined')); >> server.js
echo app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); >> server.js
echo mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(err => console.error(err)); >> server.js
echo app.use('/api/auth', authRoutes); >> server.js
echo app.use('/api/users', userRoutes); >> server.js
echo app.use('/api/entries', entryRoutes); >> server.js
echo app.use('/api/dashboard', dashboardRoutes); >> server.js
echo app.use('/api/hierarchy', hierarchyRoutes); >> server.js
echo app.use('/api/mis', misImportRoutes); >> server.js
echo app.get('/api/health', (req,res) => res.json({status:'ok'})); >> server.js
echo const PORT = process.env.PORT || 5000; >> server.js
echo app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); >> server.js

:: Update seed.js (add full user seeding)
copy /y nul seed.js >nul
echo require('dotenv').config(); > seed.js
echo const mongoose = require('mongoose'); >> seed.js
echo const bcrypt = require('bcryptjs'); >> seed.js
echo const User = require('./models/User'); >> seed.js
echo const Branch = require('./models/Branch'); >> seed.js
echo const District = require('./models/District'); >> seed.js
echo (async () => { >> seed.js
echo   await mongoose.connect(process.env.MONGODB_URI); >> seed.js
echo   await User.deleteMany({}); >> seed.js
echo   await Branch.deleteMany({}); >> seed.js
echo   await District.deleteMany({}); >> seed.js
echo   const district = new District({ name: 'Addis Ababa', code: 'AA001' }); >> seed.js
echo   await district.save(); >> seed.js
echo   const branch = new Branch({ name: 'Sealitemihiret Branch', code: 'SL001', districtId: district._id }); >> seed.js
echo   await branch.save(); >> seed.js
echo   const hash = await bcrypt.hash('password123', 10); >> seed.js
echo   const users = [ >> seed.js
echo     { employeeId: 'EMP001', fullName: 'Test Employee', email: 'employee@test.com', passwordHash: hash, role: 'employee', branchId: branch._id, districtId: district._id }, >> seed.js
echo     { employeeId: 'BM001', fullName: 'Branch Manager', email: 'bm@test.com', passwordHash: hash, role: 'branch_manager', branchId: branch._id, districtId: district._id }, >> seed.js
echo     { employeeId: 'DM001', fullName: 'District Manager', email: 'dm@test.com', passwordHash: hash, role: 'district_manager', districtId: district._id }, >> seed.js
echo     { employeeId: 'HO001', fullName: 'Head Office Admin', email: 'ho@test.com', passwordHash: hash, role: 'ho_admin' } >> seed.js
echo   ]; >> seed.js
echo   for (const u of users) await User.create(u); >> seed.js
echo   console.log('Seeded successfully'); >> seed.js
echo   process.exit(); >> seed.js
echo })(); >> seed.js

echo All backend files created successfully!
pause