import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import requestIp from "request-ip";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build folder
const buildPath = path.join(__dirname, "../../client/dist");
app.use(express.static(buildPath));

/**
 * 📌 API: Greet a user
 */
app.post("/api/greet", (req: Request, res: Response): void => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: "Name is required." });
        return;
    }
    res.status(200).json({ message: `Hello, ${name}! Welcome to the app.` });
});

/**
 * 📌 API: Get user IP & Location
 */
app.get("/api/get-location", async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user's IP address
        let clientIp: string | null = requestIp.getClientIp(req);

        if (!clientIp || clientIp === "127.0.0.1" || clientIp === "::1") {
            clientIp = "8.8.8.8"; // Default for local testing
        }

        console.log("Detected IP:", clientIp);

        // Fetch geolocation data
        const { data } = await axios.get(`http://ip-api.com/json/${clientIp}`);

        if (data.status === "fail") {
            res.status(400).json({ message: "Unable to fetch location" });
            return;
        }

        res.json({
            ip: clientIp,
            country: data.country,
            region: data.regionName,
            city: data.city,
            lat: data.lat,
            lon: data.lon,
            isp: data.isp
        });
    } catch (error) {
        console.error("Error fetching IP location:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Serve React frontend for all other routes
app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
