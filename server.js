const userRoutes = require('./routes/userRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const intentRoutes = require('./routes/intentRoutes');
const utteranceRoutes = require('./routes/utteranceRoutes');
const actionRoutes = require('./routes/actionRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const storyRoutes = require('./routes/storyRoutes');
const percakapanRoutes = require('./routes/percakapanRoutes');
const rasaRoutes = require('./routes/rasaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
// const dashboardAtlasRoutes = require('./routes/dashboardAtlasRoutes');
const rasaConfigRoutes = require('./routes/rasaConfigRoutes');
const riwayatPelatihanRoutes = require('./routes/riwayatPelatihanRoutes');
const trackerAtlasRoutes = require('./routes/trackerAtlasRoutes');
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
require('dotenv').config();

//database mongodb
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_LOCAL_URL);
        // await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');
        //start server if connected to database
        const PORT = 8000;
        app.listen(PORT, () => {
            console.log(`Server is active on port ${PORT}`);
        })
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
}

connectDB();

//middleware
app.use(express.json());
express.urlencoded({extended: true});
app.use(cookieParser());

app.use(express.json({ limit: "100mb" })); // Increase JSON payload size
app.use(express.urlencoded({ limit: "100mb", extended: true }));

//cors
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

//routes
app.use(userRoutes);
app.use(trackerRoutes);
app.use(intentRoutes);
app.use(utteranceRoutes);
app.use(actionRoutes);
app.use(ruleRoutes);
app.use(storyRoutes);
app.use(percakapanRoutes);
app.use(rasaRoutes);
app.use(dashboardRoutes);
// app.use(dashboardAtlasRoutes);
app.use(rasaConfigRoutes);
app.use(riwayatPelatihanRoutes);
app.use(trackerAtlasRoutes);