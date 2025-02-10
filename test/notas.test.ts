import request from "supertest";
import app from "../app";
import createMongoConnection from "../context/mongo.db";
import { collections } from "../context/mongo.db";
import {cafe1,cafe2} from "./test.items";
import Cafe from "../src/cafes/domain/Cafe";

describe("API Cafes Tests", () => {

    beforeAll(async () => {
        await createMongoConnection();
        await collections.usuarios.deleteMany({});
        await collections.cafes.deleteMany({});
        await collections.notas.deleteMany({});
    });

    beforeEach(async () => {
        await collections.cafes.deleteMany({});
        await collections.usuarios.deleteMany({});
        await collections.notas.deleteMany({});
        await collections.cafes.insertMany([cafe1,cafe2]);
    });

    it("GET /api/notas/valorables", async () => {
        const token = await doRegistro("testnotas", "testnotas", "testnotas");
        await valorar(token, cafe1, 5);
        const response = await request(app)
            .get("/api/notas/valorables")
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.notas).toHaveLength(1);
        expect(response.body.notas.map((nota: any) => nota.cafe.nombre)).toContain(cafe1.nombre);
        expect(response.body.notas[0].nota).toBe(5);
    });

    it("PUT /api/notas/valorar", async () => {
        const token = await doRegistro("testnotas", "testnotas", "testnotas");
        const response = await request(app)
            .put("/api/notas/valorar")
            .set('Authorization', `Bearer ${token}`)
            .send({
                cafe: cafe1,
                nota: 5
            });

        expect(response.status).toBe(200);
        expect(response.body.nota.cafe.nombre).toBe(cafe1.nombre);
        expect(response.body.nota.nota).toBe(5);
    });

    it("GET /api/notas/sinvalorar", async () => {
        const token = await doRegistro("testnotas", "testnotas", "testnotas");
        await valorar(token, cafe1, 5);
        const response = await request(app)
            .get("/api/notas/sinvalorar")
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    it("GET /api/notas/valoradas", async () => {
        const token = await doRegistro("testnotas", "testnotas", "testnotas");
        await valorar(token, cafe1, 4);
        const response = await request(app)
            .get("/api/notas/valoradas")
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body.map((nota: any) => nota.cafe.nombre)).toContain(cafe1.nombre);
        expect(response.body[0].nota).toBe(4);
    });

});

const doRegistro = async (correo: string, password: string,alias:string) => {
    const response = await request(app)
        .post("/api/usuarios/registro")
        .send({
            correo,
            password,
            alias
        });
        
    return response.body.token;
}


const valorar = async (token: string, cafe: Cafe, nota: number) => {
    const response = await request(app)
        .put("/api/notas/valorar")
        .set('Authorization', `Bearer ${token}`)
        .send({
            cafe,
            nota
        });

    return response.body;
}