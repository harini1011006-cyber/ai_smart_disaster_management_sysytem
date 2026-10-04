const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

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

const users = [];
const sosRequests = [];
const alerts = [];
const disasters = [];
const rescueTeams = [];
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

app.post("/api/register", (req, res) => {
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

        const existingUser = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already registered with this email"
            });
        }

        const newUser = {
            id: users.length + 1,
            fullName: userName,
            age: age || null,
            gender: gender || null,
            email,
            phone,
            address: address || "",
            location: location || "",
            userType: userType || "Citizen",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        res.status(201).json({
            success: true,
            message: "Emergency account created successfully",
            user: newUser
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
// 2. DASHBOARD
// API: GET /api/dashboard
// =====================================================

app.get("/api/dashboard", (req, res) => {
    const activeAlerts = alerts.filter(
        alert => alert.status === "Active"
    ).length;

    const activeSOS = sosRequests.filter(
        sos => sos.status !== "Resolved"
    ).length;

    res.json({
        success: true,
        data: {
            totalUsers: users.length,
            activeAlerts,
            activeSOS,
            rescueTeams: rescueTeams.length,
            totalShelters: shelters.length,
            availableBeds: shelters.reduce(
                (total, shelter) => total + shelter.availableBeds,
                0
            ),
            recentAlerts: alerts.slice(-5).reverse(),
            recentSOS: sosRequests.slice(-5).reverse()
        }
    });
});

// =====================================================
// 3. DISASTER DETECTION & PREDICTION
// API: GET /api/disaster/prediction
// API: POST /api/disaster/prediction
// =====================================================

app.get("/api/disaster/prediction", (req, res) => {
    res.json({
        success: true,
        data: {
            currentRisk: "Low",
            riskScore: 25,
            predictedDisaster: "Heavy Rainfall",
            probability: 35,
            location: "Coimbatore",
            rainfall: 86,
            temperature: 27,
            windSpeed: 60,
            waterLevel: 85,
            recommendation:
                "Continue monitoring weather conditions and stay alert."
        }
    });
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

app.get("/api/monitoring", (req, res) => {
    res.json({
        success: true,
        data: {
            location: "Coimbatore",
            liveStatus: "Monitoring",
            rainfall: 86,
            temperature: 27,
            windSpeed: 60,
            waterLevel: 85,
            fireRisk: "Low",
            lastUpdated: new Date().toISOString()
        }
    });
});

app.post("/api/monitoring", (req, res) => {
    res.json({
        success: true,
        message: "Monitoring data updated",
        data: {
            ...req.body,
            updatedAt: new Date().toISOString()
        }
    });
});

// =====================================================
// 5. EMERGENCY ALERT & NOTIFICATION
// API: GET /api/alerts
// API: POST /api/alerts
// =====================================================

app.get("/api/alerts", (req, res) => {
    res.json({
        success: true,
        count: alerts.length,
        data: alerts
    });
});

app.post("/api/alerts", (req, res) => {
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

    const alert = {
        id: alerts.length + 1,
        title,
        message,
        type: type || "Emergency",
        location: location || "Unknown",
        severity: severity || "High",
        status: "Active",
        createdAt: new Date().toISOString()
    };

    alerts.push(alert);

    res.status(201).json({
        success: true,
        message: "Emergency alert created",
        data: alert
    });
});

// =====================================================
// 6. SOS & VICTIM MANAGEMENT
// API: GET /api/sos
// API: POST /api/sos
// API: PUT /api/sos/:id
// =====================================================

app.get("/api/sos", (req, res) => {
    res.json({
        success: true,
        count: sosRequests.length,
        data: sosRequests
    });
});

app.post("/api/sos", (req, res) => {
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

    const sos = {
        id: sosRequests.length + 1,
        userId: userId || null,
        name: name || "Unknown Victim",
        phone: phone || "",
        location: location || "",
        latitude: latitude || null,
        longitude: longitude || null,
        emergencyType: emergencyType || "General Emergency",
        description: description || "",
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    sosRequests.push(sos);

    res.status(201).json({
        success: true,
        message: "SOS request received successfully",
        data: sos
    });
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

app.get("/api/rescue-teams", (req, res) => {
    res.json({
        success: true,
        count: rescueTeams.length,
        data: rescueTeams
    });
});

app.post("/api/rescue-teams", (req, res) => {
    const {
        teamName,
        teamLeader,
        members,
        location,
        status,
        contact
    } = req.body;

    if (!teamName) {
        return res.status(400).json({
            success: false,
            message: "Team name is required"
        });
    }

    const team = {
        id: rescueTeams.length + 1,
        teamName,
        teamLeader: teamLeader || "",
        members: members || [],
        location: location || "",
        status: status || "Available",
        contact: contact || "",
        createdAt: new Date().toISOString()
    };

    rescueTeams.push(team);

    res.status(201).json({
        success: true,
        message: "Rescue team created successfully",
        data: team
    });
});

// =====================================================
// 8. AI RESCUE ROUTE & LIVE TRACKING
// API: POST /api/rescue-route
// API: GET /api/live-tracking
// =====================================================

app.post("/api/rescue-route", (req, res) => {
    const {
        startLocation,
        destination,
        victimLocation
    } = req.body;

    res.json({
        success: true,
        message: "Rescue route generated",
        data: {
            startLocation: startLocation || "",
            destination: destination || "",
            victimLocation: victimLocation || "",
            routeStatus: "Safe Route Available",
            estimatedDistance: "5.2 km",
            estimatedTime: "12 minutes",
            trafficStatus: "Normal",
            routeType: "AI Recommended"
        }
    });
});

app.get("/api/live-tracking", (req, res) => {
    res.json({
        success: true,
        data: {
            rescueTeam: {
                id: 1,
                name: "Rescue Team Alpha",
                latitude: 11.0168,
                longitude: 76.9558,
                status: "Moving"
            },
            victim: {
                latitude: 11.0200,
                longitude: 76.9600,
                status: "Waiting for Rescue"
            },
            lastUpdated: new Date().toISOString()
        }
    });
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

app.get("/api/reports", (req, res) => {
    const totalPeopleAssisted = sosRequests.filter(
        item => item.status === "Resolved"
    ).length;

    res.json({
        success: true,
        data: {
            totalDisasters: disasters.length,
            peopleAssisted: totalPeopleAssisted,
            rescueOperations: rescueTeams.length,
            activeAlerts: alerts.filter(
                alert => alert.status === "Active"
            ).length,
            totalSOS: sosRequests.length,
            totalShelters: shelters.length,
            availableBeds: shelters.reduce(
                (total, shelter) => total + shelter.availableBeds,
                0
            ),
            disasterReports: disasters,
            emergencyReports: alerts,
            sosReports: sosRequests
        }
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
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

app.listen(PORT, () => {
    console.log("==========================================");
    console.log("Smart AI Disaster Management Backend");
    console.log("Server running successfully");
    console.log(`http://localhost:${PORT}`);
    console.log("==========================================");
});