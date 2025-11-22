import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./bd.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(process.env.PORT || 3001, () =>
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3001}`)
);
