import request from "supertest";
import app from "../app";
import createMongoConnection from "../context/mongo.db";
import { collections } from "../context/mongo.db";
import { cafe1, cafe2, cafe3 } from "./test.items";

describe("API Usuarios Tests", () => {
    
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
        await collections.usuarios.deleteMany({});
        await collections.cafes.deleteMany({});
    });

    it("POST /api/usuarios/registro", async () => {
        const response = await request(app)
            .post("/api/usuarios/registro")
            .send({
                "alias": "test",
                "correo": "test",
                "password": "test"
            });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.alias).toBe("test");
        expect(response.body.usuario.correo).toBe("test");
        expect(response.body.usuario.cesta).toBeDefined();
        expect(response.body.usuario.cesta.length).toBe(0);
        expect(response.body.usuario.foto).toBe("default.png"); 
    });
   
    it("POST /api/usuarios/registro/admin", async () => {
        const response = await request(app)
            .post("/api/usuarios/registro/admin")
            .send({
                "alias": "test",
                "correo": "test",
                "password": "test",
                "tienda_alias": "test"
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.alias).toBe("test");
        expect(response.body.usuario.correo).toBe("test");
        expect(response.body.usuario.cafes).toBeDefined();  
        expect(response.body.usuario.cafes.length).toBe(0);
        expect(response.body.usuario.foto).toBe("default.png");   
    });


    it("POST /api/usuarios/login", async () => {
        doRegistro("test", "test","test");
        const response = await request(app)
            .post("/api/usuarios/login")
            .send({
                "correo": "test",
                "password": "test"
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.alias).toBe("test");
        expect(response.body.usuario.correo).toBe("test");
        expect(response.body.usuario.cesta).toBeDefined();
        expect(response.body.usuario.cesta.length).toBe(0);
        expect(response.body.usuario.foto).toBe("default.png"); 
    });

    it("POST /api/usuarios/login Admin", async () => {
        await doRegistroAdmin("test","test","test","test");
        const response = await request(app)
            .post("/api/usuarios/login")
            .send({
                "correo": "test",
                "password": "test",
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.alias).toBe("test");
        expect(response.body.usuario.correo).toBe("test");
        expect(response.body.usuario.cafes).toBeDefined();  
        expect(response.body.usuario.cafes.length).toBe(0);
        expect(response.body.usuario.foto).toBe("default.png");   
    });

    it("PUT Añadir /api/usuarios/cesta", async () => {
        const token = await doRegistro("test", "test","test");
        
        const response = await request(app)
            .put("/api/usuarios/cesta")
            .set('Authorization', `Bearer ${token}`)
            .send({
                "cafe": cafe1,
                "accion": "añadir"
            });
        expect(response.status).toBe(200);
        expect(response.body.usuario.cesta.length).toBe(1);
        expect(response.body.usuario.cesta[0].nombre).toBe("Cafe 1");
        expect(response.body.usuario.cesta[0].cantidad).toBe(1);
        
    });

    it("PUT Borrar /api/usuarios/cesta", async () => {
        const token = await doRegistro("test", "test","test");
        await añadirCafe(token, cafe1);
        await añadirCafe(token, cafe1);
        const response = await request(app)
            .put("/api/usuarios/cesta")
            .set('Authorization', `Bearer ${token}`)
            .send({
                "cafe": cafe1,
                "accion": "eliminar"
            });
        expect(response.status).toBe(200);
        expect(response.body.usuario.cesta.length).toBe(1);
        expect(response.body.usuario.cesta[0].nombre).toBe("Cafe 1");
        expect(response.body.usuario.cesta[0].cantidad).toBe(1);
    });
 
    it("DELETE /api/usuarios/limpiar", async () => {
        const token = await doRegistro("test", "test","test");
        await añadirCafe(token, cafe3);
        await añadirCafe(token, cafe1);
        const response = await request(app)
            .delete("/api/usuarios/limpiar")
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.usuario.cesta.length).toBe(0);
    });


    it("Actualizar /api/usuarios/actualizar", async () => {
        const token = await doRegistro("test", "test","test");
        
        const response = await request(app)
            .put("/api/usuarios/actualizar")
            .set('Authorization', `Bearer ${token}`)
            .send({"datosCambiar" :{
                "nombre": "test2",
                "password": "test2",
                "alias" : "test2"
            }});
        expect(response.status).toBe(200);
        expect(response.body.usuario.alias).toBe("test2");
        expect(response.body.usuario.correo).toBe("test");
    });
    
    it("Actualizar /api/usuarios/actualizar Admin", async () => {
        const token = await doRegistroAdmin("test", "test","test","test");
        const response = await request(app)
            .put("/api/usuarios/actualizar")
            .set('Authorization', `Bearer ${token}`)
            .send({"datosCambiar" :{
                "nombre": "test2",
                "password": "test2",
                "alias" : "test2"
            }});
        expect(response.status).toBe(200);
        expect(response.body.usuario.alias).toBe("test2");
        expect(response.body.usuario.correo).toBe("test");
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

const doRegistroAdmin = async (correo: string, password: string,alias:string,tienda_alias:string) => {
    const response = await request(app)
        .post("/api/usuarios/registro/admin")
        .send({
            correo,
            password,
            alias,
            tienda_alias
        });

    return response.body.token;
}

const añadirCafe = async (token: string, cafe: any) => {
    const response = await request(app)
        .put("/api/usuarios/cesta")
        .set('Authorization', `Bearer ${token}`)
        .send({
            cafe,
            "accion": "añadir"
        });

    return response.body.usuario;
}