import pandas as pd
from pymongo import MongoClient

# Configuración de la conexión a MongoDB
MONGO_CONFIG = {
    "host": "localhost",
    "port": 27017,
    "database": "cafeteria",
    "collection": "cafes",
    "username": "admin",
    "password": "admin123"
}

# Ruta del archivo CSV
CSV_FILE = "cafes_1000000.csv"

# Conectar a MongoDB
def connect_mongo():
    client = MongoClient(
        MONGO_CONFIG["host"],
        MONGO_CONFIG["port"],
        username=MONGO_CONFIG["username"],
        password=MONGO_CONFIG["password"]
    )
    return client[MONGO_CONFIG["database"]]

# Insertar tiendas y retornar sus IDs
def insert_tiendas(df, mongo_db):
    usuarios_collection = mongo_db["usuarios"]
    tiendas_users = []
    
    # Crear lista de tiendas a insertar evitando duplicados
    tiendas_unique = df[["Tienda"]].drop_duplicates().reset_index(drop=True)

    for _, row in tiendas_unique.iterrows():
        tienda = {
            "tienda_alias": row["Tienda"],
            "alias": row["Tienda"],
            "correo": f"{row['Tienda']}@gmail.com",
            # Contraseña hash para "1234"
            "contraseña": "$2b$10$SzP2BSAbT1u9XcDuBF1Z2OKdHs8BUo8z95pXDKwTO.hHttDnOzrXW",
            "foto": "default.png",
            "cafes": []
        }
        # Insertar tienda y almacenar el id
        result = usuarios_collection.insert_one(tienda)
        tienda["tienda_id"] = result.inserted_id
        tiendas_users.append(tienda)

    print(f"{len(tiendas_users)} tiendas insertadas correctamente.")
    return {tienda["tienda_alias"]: tienda["tienda_id"] for tienda in tiendas_users}

# Insertar datos de cafes y actualizar tiendas
def insert_data():
    df = pd.read_csv(CSV_FILE)
    mongo_db = connect_mongo()
    cafes_collection = mongo_db[MONGO_CONFIG["collection"]]

    # Insertar tiendas primero y obtener el mapeo de alias a IDs
    tienda_map = insert_tiendas(df, mongo_db)

    cafes_batch = []

    for _, row in df.iterrows():
        tienda_id = tienda_map.get(row["Tienda"])
        if tienda_id:
            cafe = {
                "nombre": row["Nombre"],
                "tueste": row["Tueste"],
                "precio": row["Precio"],
                "peso": row["Peso"],
                "tienda": {
                    "tienda_alias": row["Tienda"],
                    "tienda_id": tienda_id
                }
            }
            cafes_batch.append(cafe)

    # Insertar cafes en lote para mayor eficiencia
    if cafes_batch:
        cafes_collection.insert_many(cafes_batch)
        print(f"{len(cafes_batch)} cafes insertados correctamente.")

        # Actualizar las tiendas con los cafes insertados
        for cafe in cafes_batch:
            mongo_db["usuarios"].update_many(
                {"_id": cafe["tienda"]["tienda_id"]},
                {"$push": {"cafes": cafe}}
            )

if __name__ == "__main__":
    insert_data()
