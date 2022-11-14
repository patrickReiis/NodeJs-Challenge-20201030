import { dataSource } from '../db/get-data-source';
import { Product } from '../db/entity/Product';
import { CronTrack } from '../db/entity/CronTrack';
import {Request, Response } from 'express';
import { hour, minute } from '../cron/execute';

export async function statusHandler(req:Request, res:Response) {
    const cronRepo = await dataSource.getRepository(CronTrack);
    const cron = await cronRepo.findOneBy( { id: 1 });
    
    if (cron == null) {

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end( JSON.stringify({ 
            status: `CRON não foi executado ainda. CRON será executado sempre no horario ${hour}:${minute}`
        }) );
        return
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end( JSON.stringify({ 
        status: `Ultima execução do CRON foi em ${cron.lastUpdate}`
    }) );
    return
}

export async function listProductsHandler(req:Request, res:Response) {
    const productsLimit = 5;

    const queryParams = req.query;

    if (queryParams['p'] == undefined) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end( JSON.stringify({ 
            error: `URL faltando a key 'p' (pagina). Exemplo: /products/?p=5`
        }) );

        return
    }

    const onlyNumbers = /^[0-9]+$/;
    if (onlyNumbers.test((queryParams['p'] as string)) && ((queryParams['p'] as unknown) as number) > 0) {

        const products = await dataSource.getRepository(Product).find({
            skip: (queryParams['p'] as unknown) as number -1, // skip jumps the first item, so subtract by 1
            take: productsLimit
        }) 

        const productsFormatted = products.map((e,i) => {
            e['food'];
            e.food.imported_t = (e.imported_t as unknown) as string;
            e.food.status= e.status;
            return e['food']
        })

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify( { products: productsFormatted}));
    }
    else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end( JSON.stringify({ 
            error: `key 'p' (pagina) pode conter apenas valores numericos maiores que 0. Exemplo: /products/?p=5`
        }) );
    }
}

export function specificProductHandler(req:Request, res:Response) {
    res.end('only one product');
}
