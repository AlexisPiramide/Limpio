import request from "supertest";
import app from "../app";
import createMongoConnection from "../context/mongo.db";
import { collections } from "../context/mongo.db";
import {cafe1,cafe2,cafeNuevo} from "./test.items";

describe("API Cafes Tests", () => {

    beforeAll(async () => {
        await createMongoConnection();

        await collections.usuarios.deleteMany({});
        await collections.cafes.deleteMany({});
    });

    beforeEach(async () => {
        await collections.cafes.deleteMany({});
        await collections.usuarios.deleteMany({});
        await collections.cafes.insertMany([cafe1,cafe2]);
    });

    afterAll(async () => {
        await collections.cafes.deleteMany({});
    });

    it("GET /api/notas", async () => {
        
        const response = await request(app)
            .get("/api/notas/valorables");
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body.map((nota: any) => nota.nombre)).toContain("Nota 1");
        expect(response.body.map((nota: any) => nota.nombre)).toContain("Nota 2");
    });

});

const doRegistro = async (tienda_alias: string, email: string, password: string, nombre: string) => {
    const response = await request(app)
        .post("/api/usuarios/registro/admin")
        .send({
            tienda_alias,
            email,
            password,
            nombre
        });

    if (response.status !== 200) {
        throw new Error('Failed to register user');
    }

    return response.body.token;
};
