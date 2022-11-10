import express, {Application, Request, Response } from 'express';

export const app:Application = express();

// middleware
app.use(express.json()); // parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })) // parses incoming requests with urlencoded payloads


app.get('/', statusHandler);

app.get('/products', listProductsHandler);

// All the following routes will have the format:
// /products/<any-number>
// e.g: /products/123
const productIdRoute = '/products/:code([0-9]+)'

app.get(productIdRoute, specificProductHandler)

app.put(productIdRoute, updateProductHandler)

app.delete(productIdRoute, deleteHandler)


