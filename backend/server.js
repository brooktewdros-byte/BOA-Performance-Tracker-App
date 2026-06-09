require('dotenv').config(); 
const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const helmet = require('helmet'); 
const morgan = require('morgan'); 
const path = require('path'); 
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/users'); 
const entryRoutes = require('./routes/entries'); 
const dashboardRoutes = require('./routes/dashboard'); 
const hierarchyRoutes = require('./routes/hierarchy'); 
const misImportRoutes = require('./routes/misImport'); 
const app = express(); 
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 
app.use(morgan('combined')); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
mongoose.connect(process.env.MONGODB_URI).then(() = connected')).catch(err =
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/entries', entryRoutes); 
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/hierarchy', hierarchyRoutes); 
app.use('/api/mis', misImportRoutes); 
app.get('/api/health', (req,res) =
app.listen(PORT, () = running on port ${PORT}`)); 
