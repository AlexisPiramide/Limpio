import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import usuarioRouter from "./usuarios/infraestructure/rest/usuarios.rest"
import cafeRouter from "./cafes/infraestructure/rest/cafes.rest"
import notaRouter from "./notas/infrastructure/rest/notas.rest"

import pedidosRouter from "./pedidos/infrastructure/rest/pedidos.rest"

import createMongoConnection from "../context/mongo.db";
createMongoConnection()

dotenv.config();

const allowedOrigins = ["http://localhost:5173","https://44.212.1.19:5173","http://localhost:5174","https://44.212.1.19:5174,https://main.d2iwgcwwl5ssby.amplifyapp.com/"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app = express();
app.use(express.json());
app.use(cors(options));

app.use(`/api/usuarios`, usuarioRouter);
app.use(`/api/cafes`, cafeRouter);
app.use(`/api/notas`, notaRouter);
app.use(`/api/pedidos`,pedidosRouter);
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;