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
    console.log("Received POST request for /api/greet");

    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: "Name is required." });
        console.log("Name not provided in the request body.");
        return;
    }
    res.status(200).json({ message: `Hello, ${name}! Welcome to the app.` });
    console.log(`Greeted user: ${name}`);
});

/**
 * 📌 API: Get user IP & Location
 */
app.get("/api/get-location", async (req: Request, res: Response): Promise<void> => {
    console.log("Received GET request for /api/get-location");

    try {
        // Get user's IP address
        let clientIp: string | null = requestIp.getClientIp(req);
        console.log("Initial IP detected:", clientIp);

        if (!clientIp || clientIp === "127.0.0.1" || clientIp === "::1") {
            clientIp = "8.8.8.8"; // Default for local testing
            console.log("Client IP is local, using default IP (8.8.8.8).");
        }

        // Fetch geolocation data from ip-api.com
        console.log(`Fetching geolocation data for IP: ${clientIp}`);
        const { data } = await axios.get(`http://ip-api.com/json/${clientIp}`);

        if (data.status === "fail") {
            res.status(400).json({ message: "Unable to fetch location" });
            console.log("Geolocation API failed for IP:", clientIp);
            return;
        }

        // Return geolocation data as JSON
        res.json({
            ip: clientIp,
            country: data.country,
            region: data.regionName,
            city: data.city,
            lat: data.lat,
            lon: data.lon,
            isp: data.isp
        });

        console.log("Geolocation data fetched successfully:", data);
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
