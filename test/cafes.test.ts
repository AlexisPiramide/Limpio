import request from "supertest";
import app from "../app";
import createMongoConnection from "../context/mongo.db";
import { collections } from "../context/mongo.db";
import { cafe1, cafe2 } from "./test.items";

describe("API Cafes Tests", () => {
    beforeAll(async () => {
        await createMongoConnection();
        await collections.usuarios.deleteMany({});
        await collections.cafes.deleteMany({});
        await collections.cafes.insertMany([cafe1, cafe2]);
    });

    beforeEach(async () => {
        await collections.usuarios.deleteMany({});   
    });

    afterAll(async () => {
        await collections.cafes.deleteMany({});
    });

    it("GET /api/cafes", async () => {
        const response = await request(app)
            .get("/api/cafes/0");
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body.map((cafe: any) => cafe.nombre)).toContain("Cafe 1");
        expect(response.body.map((cafe: any) => cafe.nombre)).toContain("Cafe 2");
    });

    it("GET /api/cafes/filtrados/1 cafe y tienda", async () => {
        const response = await request(app)
            .get("/api/cafes/filtrados/0")
            .send({
                nombre: "Cafe 1",
                tienda: "Carefour",
                tueste: "Torrefacto",
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].nombre).toBe("Cafe 1");
    });

    it("GET /api/cafes/filtrados/1 todo", async () => {
        const response = await request(app)
            .get("/api/cafes/filtrados/0")
            .send({
                nombre: "Cafe 1",
                tienda: "Carefour",
                tueste: "Torrefacto",
                origen: "Colombia",
                precioMax: 55,
                precioMin: 10
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].nombre).toBe("Cafe 1");
    });
    
    
    
    it("GET /api/cafes/filtrados/1 with no filters", async () => {
        const response = await request(app)
            .get("/api/cafes/filtrados/0");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
    });
    
    it("POST and DELETE /api/cafes - Should allow the same user to insert and delete a cafe", async () => {
        
        const token = await doRegistro("tienda", "test", "test", "test");
        expect(token).toBeDefined();
    

        const newCafe = {
            nombre: "CafeToDelete",
            tueste: "test",
            precio: 10,
            imagen: "testimage.png"
        };
    
        const createResponse = await request(app)
            .post("/api/cafes")
            .set('Authorization', `Bearer ${token}`)
            .send(newCafe);
    
        expect(createResponse.status).toBe(200);
    

        const deleteResponse = await request(app)
            .delete("/api/cafes")
            .set('Authorization', `Bearer ${token}`)
            .send(newCafe);
    
        expect(deleteResponse.status).toBe(200);
    

        const getResponse = await request(app)
            .get(`/api/cafes/filtrados/1`)
            .query({ nombre: newCafe.nombre });
        
        expect(getResponse.body).not.toContainEqual(newCafe);
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
