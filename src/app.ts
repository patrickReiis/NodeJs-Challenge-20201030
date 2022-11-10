import express, {Application, Request, Response } from 'express';

export const app:Application = express();

// middleware
app.use(express.json()); // parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })) // parses incoming requests with urlencoded payloads

app.get('/', (req, res) => {
    res.end('Hello, challenge.')
})
