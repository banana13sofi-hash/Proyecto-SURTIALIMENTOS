import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import fs from "fs";
import https from "https";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });


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
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FRONTEND_URL,
                "http://localhost:3000",
                "http://localhost:3002",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3002",
            ].filter(Boolean);

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Origin not allowed by CORS: ${origin}`));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json({ limit: "10kb" }));

// Serve the Public-new static site at /public-new and at root '/'
const publicNewPath = process.cwd() + '/backend/Public-new';
app.use('/public-new', express.static(publicNewPath));
app.use('/', express.static(publicNewPath));
// ✅ rutas
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// Probar conexión (health endpoint remains at /api/health)

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
