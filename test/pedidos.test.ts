import request from "supertest";
import app from "../app";
import createMongoConnection from "../context/mongo.db";
import { collections } from "../context/mongo.db";
import {cafe1,cafe2} from "./test.items";
import Cafe from "../src/cafes/domain/Cafe";
import executeQuery from "../context/postgres.connector";


describe("API Pedidos Tests", () => {

    beforeAll(async () => {
        await createMongoConnection();
        await collections.cafes.deleteMany({});
        await collections.cafes.insertMany([cafe1, cafe2]);

        await executeQuery("DELETE FROM pedidos");

    });

    beforeEach(async () => {
        await collections.usuarios.deleteMany({});
    });


    it("GET /api/pedidos", async () => {
        const token = await doRegistro("testPedidos", "testPedidos", "testPedidos");
        await añadirCesta(token, cafe1);
        await tramitarPedido(token);
        const response = await request(app)
            .get("/api/pedidos")
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    it("GET /api/pedidos/:id", async () => {
        const token = await doRegistro("testPedidos", "testPedidos", "testPedidos");
        await añadirCesta(token, cafe1);
        const result = await tramitarPedido(token);
        const response = await request(app)
            .get(`/api/pedidos/${result.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(result.id);
    });

    it("POST /api/pedidos/tramitar", async () => {
        const token = await doRegistro("testPedidos", "testPedidos", "testPedidos");
        await añadirCesta(token, cafe1);
        const response = await request(app)
            .post("/api/pedidos/tramitar")
            .set('Authorization', `Bearer ${token}`);


        expect(response.status).toBe(200);
        expect(response.body.id).toBeDefined();
    });


});


const doRegistro = async (alias: string, correo: string, password: string) => {
    const response = await request(app)
        .post("/api/usuarios/registro")
        .send({
            alias,
            correo,
            password
        });
    return response.body.token;
}

const añadirCesta = async (token: string, cafe: Cafe) => {
    const response = await request(app)
        .put("/api/usuarios/cesta")
        .set('Authorization', `Bearer ${token}`)
        .send({
            "cafe": cafe,
            "accion": "añadir"
        });
    return response.body.usuario.cesta;
}

const tramitarPedido = async (token: string) => {
    const response = await request(app)
        .post("/api/pedidos/tramitar")
        .set('Authorization', `Bearer ${token}`);
    return response.body;
}

