const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });
    

const userSchema = new mongoose.Schema({
    fullName: String,
    age: Number,
    gender: String,
    email: String,
    phone: String,
    address: String,
    location: String,
    userType: String,
    password: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const liveVictimSchema = new mongoose.Schema({
    name: String,
    phone: String,
    latitude: Number,
    longitude: Number,
    status: {
        type: String,
        default: "Waiting"
    },
    assignedTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTeam",
        default: null
    },
    rescuedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);



const liveTeamSchema = new mongoose.Schema({
    name: String,
    teamLeader: String,
    contact: String,
    members: Number,
    specialization: String,
    location: String,
    vehicle: String,
    latitude: Number,
    longitude: Number,
    status: {
        type: String,
        default: "Available"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


const rescueAllocationSchema = new mongoose.Schema({
    victimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveVictim"
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTeam"
    },
    status: {
        type: String,
        default: "Assigned"
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    rescuedAt: {
        type: Date,
        default: null
    }
});

const LiveVictim = mongoose.model("LiveVictim", liveVictimSchema);

const LiveTeam = mongoose.model("LiveTeam", liveTeamSchema);

const RescueAllocation = mongoose.model(
    "RescueAllocation",
    rescueAllocationSchema
);

// DISASTER PREDICTION SCHEMA
const predictionSchema = new mongoose.Schema({
    source: String,
    location: String,
    currentRisk: String,
    riskScore: Number,
    predictedDisaster: String,
    probability: Number,
    rainfall: Number,
    temperature: Number,
    windSpeed: Number,
    recommendation: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Prediction = mongoose.model("Prediction", predictionSchema);

// GET AI PREDICTION REPORT
app.get("/api/predictions", async (req, res) => {
    try {
        const data = await Prediction.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("Prediction Report Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


const alertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "Emergency" },
    location: { type: String, default: "Unknown" },
    severity: { type: String, default: "High" },
    status: { type: String, default: "Active" },
    createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.model("Alert", alertSchema);
const sosSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    name: { type: String, default: "Unknown Victim" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    emergencyType: {
        type: String,
        default: "General Emergency"
    },
    description: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

const SOS = mongoose.model("SOS", sosSchema);

 // MODULE 6 - VICTIM SCHEMA
const victimSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    contact: { type: String, required: true },
    status: { type: String, default: "waiting" },
    createdAt: { type: Date, default: Date.now }
});

const Victim = mongoose.model("Victim", victimSchema);

// RELIEF RESOURCE SCHEMA
const reliefResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ReliefResource = mongoose.model(
    "ReliefResource",
    reliefResourceSchema
);

// SAVE DEFAULT RELIEF RESOURCES TO MONGODB
app.post("/api/relief-resources/initialize", async (req, res) => {
    try {
        const resources = [
            {
                name: "Food",
                quantity: 0,
                description: "Food packets for affected people."
            },
            {
                name: "Drinking Water",
                quantity: 0,
                description: "Safe drinking water for affected people."
            },
            {
                name: "Medical Support",
                quantity: 0,
                description: "First aid and emergency medical assistance."
            },
            {
                name: "Relief Kits",
                quantity: 0,
                description: "Clothing, blankets and hygiene supplies."
            }
        ];

        for (const item of resources) {
            await ReliefResource.findOneAndUpdate(
                { name: item.name },
                { $setOnInsert: item },
                { upsert: true, new: true }
            );
        }

        const data = await ReliefResource.find().sort({ _id: 1 });

        res.json({
            success: true,
            message: "Relief resources initialized successfully",
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("Relief Resources Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET RELIEF RESOURCES
app.get("/api/relief-resources", async (req, res) => {
    try {
        const data = await ReliefResource.find().sort({ _id: 1 });

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// TEMPORARY DATA
// Later this can be connected to MongoDB
// ================================
const shelters = [
    {
        id: 1,
        name: "Government Relief Shelter",
        location: "Coimbatore",
        capacity: 500,
        occupied: 275,
        availableBeds: 225,
        status: "Available"
    },
    {
        id: 2,
        name: "Emergency Community Shelter",
        location: "Coimbatore",
        capacity: 300,
        occupied: 180,
        availableBeds: 120,
        status: "Available"
    }
];

// ================================
// HOME / SERVER CHECK
// ================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart AI Disaster Management Backend is running",
        server: "Node.js + Express",
        port: PORT
    });
});

// =====================================================
// 1. REGISTER
// API: POST /api/register
// =====================================================
app.post("/api/register", async (req, res) => {
    try {
        const {
            fullName,
            name,
            age,
            gender,
            email,
            phone,
            address,
            location,
            userType,
            password
        } = req.body;

        const userName = fullName || name;

        if (!userName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already registered with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName: userName,
            age: age || null,
            gender: gender || null,
            email: email.toLowerCase(),
            phone,
            address: address || "",
            location: location || "",
            userType: userType || "Citizen",
            password: hashedPassword
        });

        const userResponse = newUser.toObject();

        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "Emergency account created successfully",
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
});

// =====================================================
// 2. DASHBOARD — MongoDB data
//======================================================
app.get("/api/dashboard", async (req, res) => {
    try {
        const activeAlerts = await Alert.countDocuments({
            status: "Active"
        });

        const activeSOS = await SOS.countDocuments({
            status: { $ne: "Resolved" }
        });

        const totalUsers = await User.countDocuments();
        const rescueTeams = await LiveTeam.countDocuments({
            status: "Available"
        });

        const recentAlerts = await Alert.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentSOS = await SOS.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeAlerts,
                activeSOS,
                rescueTeams,
                totalShelters: shelters.length,
                availableBeds: shelters.reduce(
                    (total, shelter) =>
                        total + shelter.availableBeds,
                    0
                ),
                recentAlerts,
                recentSOS
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load dashboard",
            error: error.message
        });
    }
});

 // WEATHER API — Open-Meteo
app.get("/api/weather", async (req, res) => {
    try {
        const latitude = Number(req.query.latitude ?? 11.0168);
        const longitude = Number(req.query.longitude ?? 76.9558);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
            `&timezone=Asia%2FKolkata`;

        const response = await fetch(url);

if (!response.ok) {
    const details = await response.text();
    console.error("Open-Meteo Error:", response.status, details);
    throw new Error(`Weather API HTTP ${response.status}`);
}

        const weather = await response.json();

        res.json({
            success: true,
            source: "Open-Meteo",
            location: {
                latitude: weather.latitude,
                longitude: weather.longitude
            },
            data: weather.current
        });
    } catch (error) {
        res.status(502).json({
            success: false,
            message: "Unable to fetch weather data",
            error: error.message
        });
    }
});
// =====================================================
// 3. DISASTER DETECTION & PREDICTION
// API: GET /api/disaster/prediction
// API: POST /api/disaster/prediction
// =====================================================


app.get("/api/disaster/prediction", async (req, res) => {
    try {
        const latitude = Number(req.query.latitude ?? 11.0168);
        const longitude = Number(req.query.longitude ?? 76.9558);

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
            `&daily=precipitation_sum` +
            `&timezone=Asia%2FKolkata`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather service unavailable");
        }

        const weather = await response.json();
        const current = weather.current;
        const rainfall = Number(current.precipitation) || 0;
        const temperature = Number(current.temperature_2m) || 0;
        const windSpeed = Number(current.wind_speed_10m) || 0;

        let riskScore = 0;

        if (rainfall >= 20) riskScore += 30;
        else if (rainfall >= 5) riskScore += 15;

        if (windSpeed >= 60) riskScore += 25;
        else if (windSpeed >= 30) riskScore += 10;

        if (temperature >= 40) riskScore += 10;

        const risk =
            riskScore >= 60 ? "High" :
            riskScore >= 30 ? "Medium" : "Low";
            
await Prediction.findOneAndUpdate(
    { location: "Coimbatore" },
    {
        source: "Open-Meteo",
        location: "Coimbatore",
        currentRisk: risk,
        riskScore: riskScore,
        predictedDisaster:
            rainfall >= 20 ? "Heavy Rainfall" :
            windSpeed >= 60 ? "Strong Winds" :
            "No major weather threat detected",
        probability: riskScore,
        rainfall: rainfall,
        temperature: temperature,
        windSpeed: windSpeed,
        recommendation:
            risk === "High"
                ? "Follow official weather alerts and safety instructions."
                : risk === "Medium"
                ? "Monitor weather conditions and stay alert."
                : "Continue monitoring weather conditions.",
        createdAt: new Date()
    },
    { upsert: true, new: true }
);



        res.json({
            success: true,
            source: "Open-Meteo",
            data: {
                currentRisk: risk,
                riskScore,
                predictedDisaster:
                    rainfall >= 20 ? "Heavy Rainfall" :
                    windSpeed >= 60 ? "Strong Winds" : "No major weather threat detected",
                probability: riskScore,
                location: "Coimbatore",
                rainfall,
                temperature,
                windSpeed,
                recommendation:
                    risk === "High"
                        ? "Follow official weather alerts and safety instructions."
                        : risk === "Medium"
                        ? "Monitor weather conditions and stay alert."
                        : "Continue monitoring weather conditions."
            }
        });
    } catch (error) {
        res.status(502).json({
            success: false,
            message: "Unable to generate prediction",
            error: error.message
        });
    }
});
   

app.post("/api/disaster/prediction", (req, res) => {
    const {
        location,
        rainfall,
        temperature,
        windSpeed,
        waterLevel
    } = req.body;

    let riskScore = 0;

    if (Number(rainfall) >= 100) riskScore += 30;
    else if (Number(rainfall) >= 50) riskScore += 15;

    if (Number(waterLevel) >= 90) riskScore += 30;
    else if (Number(waterLevel) >= 70) riskScore += 15;

    if (Number(windSpeed) >= 80) riskScore += 25;
    else if (Number(windSpeed) >= 50) riskScore += 10;

    let risk = "Low";

    if (riskScore >= 60) {
        risk = "High";
    } else if (riskScore >= 30) {
        risk = "Medium";
    }

    const disaster = {
        id: disasters.length + 1,
        location: location || "Unknown",
        rainfall: Number(rainfall) || 0,
        temperature: Number(temperature) || 0,
        windSpeed: Number(windSpeed) || 0,
        waterLevel: Number(waterLevel) || 0,
        risk,
        riskScore,
        createdAt: new Date().toISOString()
    };

    disasters.push(disaster);

    res.json({
        success: true,
        message: "Disaster prediction generated",
        data: disaster
    });
});

// =====================================================
// 4. REAL-TIME DISASTER MONITORING
// API: GET /api/monitoring
// API: POST /api/monitoring
// =====================================================

// MODULE 4 - REAL-TIME DISASTER MONITORING
// MODULE 4 - REAL-TIME DISASTER MONITORING
app.get("/api/monitoring", async (req, res) => {
    try {
        // Reuse cached data for 60 seconds
        const cached = app.locals.monitoringWeatherCache;

        if (cached && Date.now() - cached.time < 60000) {
            return res.json(cached.result);
        }

        // Alternative weather API: wttr.in
        const url = "https://wttr.in/Coimbatore?format=j1";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        let response;

        try {
            response = await fetch(url, {
                signal: controller.signal,
                headers: { "User-Agent": "AISmartDisasterManagement/1.0" }
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            throw new Error(`Weather API HTTP ${response.status}`);
        }

        const weather = await response.json();
        const current = weather.current_condition?.[0];

        if (!current) {
            throw new Error("Weather data unavailable");
        }

        const temperature = Number(current.temp_C);
        const result = {
            success: true,
            source: "wttr.in",
            data: {
                location: "Coimbatore",
                liveStatus: "Monitoring",
                temperature,
                humidity: Number(current.humidity),
                rainfall: Number(current.precipMM),
                windSpeed: Number(current.windspeedKmph),
                fireRisk: temperature >= 40 ? "High" : "Low",
                lastUpdated: new Date().toISOString()
            }
        };

        app.locals.monitoringWeatherCache = {
            time: Date.now(),
            result
        };

        res.json(result);

    } catch (error) {
        console.error("Monitoring Weather Error:", error.message);

        res.status(502).json({
            success: false,
            message: "Weather data temporarily unavailable",
            error: error.message
        });
    }
});
// =====================================================
// 5. EMERGENCY ALERT & NOTIFICATION
// API: GET /api/alerts
// API: POST /api/alerts
// =====================================================

app.get("/api/alerts", async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load alerts",
            error: error.message
        });
    }
});

app.post("/api/alerts", async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            location,
            severity
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Alert title and message are required"
            });
        }

        const alert = await Alert.create({
            title,
            message,
            type: type || "Emergency",
            location: location || "Unknown",
            severity: severity || "High",
            status: "Active"
        });

        res.status(201).json({
            success: true,
            message: "Emergency alert saved to MongoDB",
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to save alert",
            error: error.message
        });
    }
});

// =====================================================
// 6. SOS & VICTIM MANAGEMENT
// API: GET /api/sos
// API: POST /api/sos
// API: PUT /api/sos/:id
// =====================================================

app.get("/api/sos", async (req, res) => {
    try {
        const sosRequests = await SOS.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: sosRequests.length,
            data: sosRequests
        });
    } catch (error) {
        console.error("Get SOS Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load SOS requests",
            error: error.message
        });
    }
});

app.post("/api/sos", async (req, res) => {
    try {
        const {
            userId,
            name,
            phone,
            location,
            latitude,
            longitude,
            emergencyType,
            description
        } = req.body;

        const sos = await SOS.create({
            userId: userId || null,
            name: name || "Unknown Victim",
            phone: phone || "",
            location: location || "",
            latitude: latitude || null,
            longitude: longitude || null,
            emergencyType: emergencyType || "General Emergency",
            description: description || "",
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "SOS request saved successfully",
            data: sos
        });

    } catch (error) {
        console.error("SOS Save Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save SOS request",
            error: error.message
        });
    }
});

app.put("/api/sos/:id", (req, res) => {
    const id = Number(req.params.id);

    const sos = sosRequests.find(item => item.id === id);

    if (!sos) {
        return res.status(404).json({
            success: false,
            message: "SOS request not found"
        });
    }

    sos.status = req.body.status || sos.status;

    res.json({
        success: true,
        message: "SOS status updated",
        data: sos
    });
});

// =====================================================
// 7. RESCUE TEAM MANAGEMENT
// API: GET /api/rescue-teams
// API: POST /api/rescue-teams
// =====================================================

app.get("/api/rescue-teams", async (req, res) => {
    try {
        const teams = await LiveTeam.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch rescue teams",
            error: error.message
        });
    }
});


app.post("/api/rescue-teams", async (req, res) => {
    try {
        const {
            teamName,
            teamLeader,
            contact,
            members,
            specialization,
            location,
            status,
            vehicle
        } = req.body;

        if (!teamName || !teamLeader) {
            return res.status(400).json({
                success: false,
                message: "Team name and team leader are required"
            });
        }

        const team = await LiveTeam.create({
            name: teamName,
            teamLeader,
            contact,
            members: Number(members) || 0,
            specialization,
            location,
            status: status || "Available",
            vehicle,
            latitude: 0,
            longitude: 0
        });

        res.status(201).json({
            success: true,
            message: "Rescue team saved to MongoDB successfully",
            data: team
        });
    } catch (error) {
        console.error("Rescue Team Save Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to save rescue team",
            error: error.message
        });
    }
});

    // =====================================================
// 8. AI RESCUE ROUTE & LIVE TRACKING
// =====================================================

// =====================================================
// GET LIVE DASHBOARD
// =====================================================

app.get("/api/live-dashboard", async (req, res) => {
    try {

        const victims = await LiveVictim.find().sort({ createdAt: -1 });
        const teams = await LiveTeam.find().sort({ createdAt: -1 });
        const victimData = victims.map(victim => ({
    id: victim._id.toString(),
    name: victim.name,
    phone: victim.phone,
    latitude: victim.latitude,
    longitude: victim.longitude,
    status: victim.status,
    assignedTeamId: victim.assignedTeamId,
    createdAt: victim.createdAt,
    updatedAt: victim.updatedAt
}));

const teamData = teams.map(team => ({
    id: team._id.toString(),
    name: team.name,
    members: team.members,
    latitude: team.latitude,
    longitude: team.longitude,
    status: team.status,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt
}));

        const activeVictims = victims.filter(
            victim => victim.status !== "Rescued"
        ).length;

        const rescuedVictims = victims.filter(
            victim => victim.status === "Rescued"
        ).length;

        const availableTeams = teams.filter(
            team => team.status === "Available"
        ).length;

        res.json({
            success: true,
            data: {
                totalVictims: victims.length,
                activeVictims,
                rescuedVictims,
                availableTeams,
                victims: victimData,
                teams: teamData,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {

        console.error("Live Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load live dashboard",
            error: error.message
        });
    }
});


// =====================================================
// ADD VICTIM
// =====================================================

app.post("/api/victims", async (req, res) => {
    try {

        const {
            name,
            phone,
            latitude,
            longitude
        } = req.body;

        if (
            !name ||
            !phone ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Victim details and location are required"
            });
        }

        const victim = await LiveVictim.create({
            name,
            phone,
            latitude: Number(latitude),
            longitude: Number(longitude),
            status: "Waiting"
        });

        res.status(201).json({
            success: true,
            message: "Victim saved to MongoDB successfully",
            data: victim
        });

    } catch (error) {

        console.error("Victim Save Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save victim",
            error: error.message
        });
    }
});


// =====================================================
// ADD RESCUE TEAM
// =====================================================

app.post("/api/teams", async (req, res) => {
    try {

        const {
            name,
            members,
            latitude,
            longitude
        } = req.body;

        if (
            !name ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Team name and location are required"
            });
        }

        const team = await LiveTeam.create({
            name,
            members: Number(members) || 0,
            latitude: Number(latitude),
            longitude: Number(longitude),
            status: "Available"
        });

        res.status(201).json({
            success: true,
            message: "Rescue team saved to MongoDB successfully",
            data: team
        });

    } catch (error) {

        console.error("Team Save Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save rescue team",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE VICTIM STATUS
// =====================================================

app.put("/api/victims/:id", async (req, res) => {
    try {

        const victim = await LiveVictim.findById(req.params.id);

        if (!victim) {
            return res.status(404).json({
                success: false,
                message: "Victim not found"
            });
        }

        if (req.body.status) {
            victim.status = req.body.status;
        }

        victim.updatedAt = new Date();

        await victim.save();

        res.json({
            success: true,
            message: "Victim status updated",
            data: victim
        });

    } catch (error) {

        console.error("Victim Update Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update victim",
            error: error.message
        });
    }
});


// =====================================================
// FIND NEAREST RESCUE TEAM
// =====================================================
app.get("/api/route/:id", async (req, res) => {
    try {

        const victim = await LiveVictim.findById(req.params.id);

        if (!victim) {
            return res.status(404).json({
                success: false,
                message: "Victim not found"
            });
        }

        const teams = await LiveTeam.find({
            status: "Available"
        });

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No available rescue team found"
            });
        }

        let nearestTeam = teams[0];
        let shortestDistance = Infinity;

        teams.forEach(team => {

            const latDifference =
                team.latitude - victim.latitude;

            const lngDifference =
                team.longitude - victim.longitude;

            const distance = Math.sqrt(
                Math.pow(latDifference, 2) +
                Math.pow(lngDifference, 2)
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestTeam = team;
            }
        });

        // =============================================
        // SAVE RESCUE ASSIGNMENT IN MONGODB
        // =============================================

        const allocation = await RescueAllocation.create({
            victimId: victim._id,
            teamId: nearestTeam._id,
            status: "Assigned"
        });

        // =============================================
        // UPDATE VICTIM
        // =============================================

        victim.assignedTeamId = nearestTeam._id;
        victim.status = "Assigned";
        victim.updatedAt = new Date();

        await victim.save();

        // =============================================
        // UPDATE RESCUE TEAM
        // =============================================

        nearestTeam.status = "Assigned";
        nearestTeam.updatedAt = new Date();

        await nearestTeam.save();

        res.json({
            success: true,
            message: "Rescue team assigned and saved to MongoDB",
            data: {
                victim,
                team: nearestTeam,
                allocation,
                distance: shortestDistance
            }
        });

    } catch (error) {

        console.error("Route Assignment Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to assign rescue team",
            error: error.message
        });
    }
});

// =====================================================
// UPDATE RESCUE TEAM LOCATION
// =====================================================

app.put("/api/teams/:id/location", async (req, res) => {
    try {

        const {
            latitude,
            longitude
        } = req.body;

        if (
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const team = await LiveTeam.findByIdAndUpdate(
            req.params.id,
            {
                latitude: Number(latitude),
                longitude: Number(longitude),
                updatedAt: new Date()
            },
            {
                new: true
            }
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Rescue team not found"
            });
        }

        res.json({
            success: true,
            message: "Rescue team location updated in MongoDB",
            data: team
        });

    } catch (error) {

        console.error("Team Location Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update team location",
            error: error.message
        });
    }
});
// =====================================================
// MARK VICTIM AS RESCUED
// =====================================================
app.put("/api/victims/:id/rescue", async (req, res) => {
    try {
        const victim = await LiveVictim.findById(req.params.id);

        if (!victim) {
            return res.status(404).json({
                success: false,
                message: "Victim not found"
            });
        }

        const allocation = await RescueAllocation.findOne({
            victimId: victim._id,
            status: "Assigned"
        }).sort({ assignedAt: -1 });

        const rescuedTime = new Date();

        victim.status = "Rescued";
        victim.rescuedAt = rescuedTime;
        victim.updatedAt = rescuedTime;

        await victim.save();

        let team = null;

        if (allocation) {
            allocation.status = "Rescued";
            allocation.rescuedAt = rescuedTime;
            await allocation.save();

            team = await LiveTeam.findByIdAndUpdate(
                allocation.teamId,
                {
                    status: "Available",
                    updatedAt: rescuedTime
                },
                { new: true }
            );
        }

        res.json({
            success: true,
            message: "Victim rescued successfully",
            data: {
                victim,
                allocation,
                rescueTeam: team,
                rescuedAt: rescuedTime
            }
        });

    } catch (error) {
        console.error("Rescue Completion Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark victim as rescued",
            error: error.message
        });
    }
});

// =====================================================
// 9. RELIEF & SHELTER MANAGEMENT
// API: GET /api/shelters
// API: POST /api/shelters
// API: PUT /api/shelters/:id
// =====================================================
app.get("/api/shelters", (req, res) => {
    res.json({
        success: true,
        count: shelters.length,
        data: shelters
    });
});

app.post("/api/shelters", (req, res) => {
    const {
        name,
        location,
        capacity,
        occupied,
        availableBeds,
        status
    } = req.body;

    if (!name || !location) {
        return res.status(400).json({
            success: false,
            message: "Shelter name and location are required"
        });
    }

    const shelter = {
        id: shelters.length + 1,
        name,
        location,
        capacity: Number(capacity) || 0,
        occupied: Number(occupied) || 0,
        availableBeds: Number(availableBeds) || 0,
        status: status || "Available"
    };

    shelters.push(shelter);

    res.status(201).json({
        success: true,
        message: "Shelter added successfully",
        data: shelter
    });
});

app.put("/api/shelters/:id", (req, res) => {
    const id = Number(req.params.id);

    const shelter = shelters.find(item => item.id === id);

    if (!shelter) {
        return res.status(404).json({
            success: false,
            message: "Shelter not found"
        });
    }

    Object.assign(shelter, req.body);

    res.json({
        success: true,
        message: "Shelter updated successfully",
        data: shelter
    });
});

// =====================================================
// 10. ANALYTICS & REPORTS
// API: GET /api/reports
// =====================================================
app.get("/api/reports/summary", async (req, res) => {

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const [totalSOS, resolvedSOS, activeAlerts, totalAlerts, sosRecords, alertRecords] =
            await Promise.all([
                SOS.countDocuments(),
                SOS.countDocuments({ status: "Resolved" }),
                Alert.countDocuments({ status: "Active" }),
                Alert.countDocuments(),
                SOS.find({ createdAt: { $gte: startDate } }),
                Alert.find({ createdAt: { $gte: startDate } })
            ]);

        const last7Days = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);

            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);

            last7Days.push({
                date: day.toISOString().slice(0, 10),
                sos: sosRecords.filter(item =>
                    item.createdAt >= day && item.createdAt < nextDay
                ).length,
                alerts: alertRecords.filter(item =>
                    item.createdAt >= day && item.createdAt < nextDay
                ).length
            });
        }

        res.json({
            success: true,
            data: {
                totalSOS,
                resolvedSOS,
                pendingSOS: totalSOS - resolvedSOS,
                totalAlerts,
                activeAlerts,
                last7Days
            }
        });
    } catch (error) {
        console.error("Reports API error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load report data",
            error: error.message
        });
    }
});

// GET DISASTERS FOR REPORT
app.get("/api/disasters", async (req, res) => {
    try {
        const data = await Disaster.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("Get Disasters Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================================
// ERROR HANDLER
// =====================================================
// AMBULANCE API
app.get("/api/ambulances", (req, res) => {
    const ambulances = [
        {
            id: 1,
            name: "Ambulance 101",
            location: "Chennai",
            status: "Available"
        },
        {
            id: 2,
            name: "Ambulance 102",
            location: "Chennai",
            status: "Available"
        },
        {
            id: 3,
            name: "Ambulance 103",
            location: "Chennai",
            status: "On Duty"
        }
    ];

    res.json({
        success: true,
        count: ambulances.length,
        data: ambulances
    });
});


app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });
});

// =====================================================
// START SERVER
// =====================================================

// REPORT SCHEMA - SAVE REPORTS TO MONGODB
const reportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    reportType: { type: String, default: "General" },
    data: { type: mongoose.Schema.Types.Mixed, default: [] },
    createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

// SAVE REPORT
app.post("/api/reports", async (req, res) => {
    try {
        const report = await Report.create({
            title: req.body.title || "Disaster Management Report",
            reportType: req.body.reportType || "General",
            data: req.body.data || []
        });

        res.status(201).json({
            success: true,
            message: "Report saved to MongoDB",
            data: report
        });
    } catch (error) {
        console.error("Save Report Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET SAVED REPORTS
app.get("/api/reports", async (req, res) => {
    try {
        const data = await Report.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// MODULE 6 - SAVE VICTIM
app.post("/api/module6/victims", async (req, res) => {
    try {
        const { name, location, contact, status } = req.body;

        if (!name || !location || !contact) {
            return res.status(400).json({
                success: false,
                message: "Name, location and contact are required"
            });
        }

        const victim = await Victim.create({
            name: name,
            location: location,
            contact: contact,
            status: status || "waiting"
        });

        res.status(201).json({
            success: true,
            message: "Victim saved successfully",
            data: victim
        });
    } catch (error) {
        console.error("Module 6 Save Victim Error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// MODULE 6 - GET VICTIMS
app.get("/api/module6/victims", async (req, res) => {
    try {
        const data = await Victim.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error("Module 6 Get Victims Error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});


app.listen(PORT, () => {
    console.log("==========================================");
    console.log("Smart AI Disaster Management Backend");
    console.log("Server running successfully");
    console.log(`http://localhost:${PORT}`);
    console.log("==========================================");
});