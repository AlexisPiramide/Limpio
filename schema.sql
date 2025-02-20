CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,       
    fecha TIMESTAMP NOT NULL,    
    usuario VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL
);

CREATE TABLE linea_pedido (
    id SERIAL PRIMARY KEY,       
    pedido_id INTEGER NOT NULL,  
    cafe VARCHAR(255) NOT NULL,  
    tueste VARCHAR(50) NOT NULL, 
    tienda_alias VARCHAR(255),   
    tienda_id VARCHAR(255),       
    cantidad INTEGER NOT NULL,  
    precio NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
);
