import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import cafeRouter from "./src/cafes/infraestructure/rest/cafes.rest"
//import notaRouter from "./src/notas/infraestructure/rest/notas.rest"
import usuarioRouter from "./src/usuarios/infraestructure/rest/usuarios.rest"
//import pedidosRouter from "./src/pedidos/infraestructure/rest/pedidos.rest"

import createMongoConnection from "./context/mongo.db";
createMongoConnection()

dotenv.config();

const allowedOrigins = ["http://localhost:5173","https://front:5173","http://localhost:5174","https://front:5174"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
app.use(express.json());
app.use(cors(options));

app.use(`/api/usuarios`, usuarioRouter);
app.use(`/api/cafes`, cafeRouter);
//app.use(`/api/notas`, notaRouter);
//app.use(`/api/pedidos`,pedidosRouter);
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;