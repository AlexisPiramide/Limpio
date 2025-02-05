const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Cafes',
    description: 'Documentacion para la API de Cafes',
  },
  host: 'localhost:8080'
};

const outputFile = './swagger-output.json';
const routes = ['./index.ts'];


swaggerAutogen(outputFile, routes, doc);