import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import fs from "fs";
import https from "https";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "http://localhost:3001"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json({ limit: "10kb" }));

// ✅ rutas
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// Probar conexión
app.get("/", (req, res) => res.send("Servidor funcionando"));

const PORT = process.env.PORT || 3001;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;
const useHttps = sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

if (useHttps) {
    const options = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
    };

    https.createServer(options, app).listen(PORT, () => {
        console.log(`Servidor seguro corriendo en https://localhost:${PORT}`);
    });
} else {
    if (sslKeyPath || sslCertPath) {
        console.warn('SSL paths configured but certificate files not found. Starting in HTTP mode.');
    }
    app.listen(PORT, () =>
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    );
}
