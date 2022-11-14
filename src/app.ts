import 'reflect-metadata';
import './cron/execute';
import express, { Application } from 'express';
import { statusHandler, listProductsHandler, specificProductHandler } from './routes/get-handler';
import { updateProductHandler } from './routes/put-handler';
import { deleteHandler } from './routes/delete-handler';

export const app:Application = express();

// middleware
app.use(express.json()); // parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })) // parses incoming requests with urlencoded payloads


app.get('/', statusHandler);

app.get('/products', listProductsHandler);

// All the following routes will have the format:
// /products/<any-text>
// e.g: /products/123a
const productIdRoute = '/products/:code'

app.get(productIdRoute, specificProductHandler)

app.put(productIdRoute, updateProductHandler)

app.delete(productIdRoute, deleteHandler)


