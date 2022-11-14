import {Request, Response } from 'express';
import { dataSource } from '../db/get-data-source';
import { Product } from '../db/entity/Product';
import { doesUserExist } from '../utils';

export async function deleteHandler(req:Request, res:Response) {

    if (await doesUserExist(req.url.slice('/products/'.length)) == true) {
        const productCode = decodeURIComponent(req.url.slice('/products/'.length));
        const product = await dataSource
            .query(`select * from product where food -> 'code' ? '${productCode}'`);

        product[0].status = 'trash';

        await dataSource.getRepository(Product).save(product);
        res.writeHead(200);
        res.end()
        return
    }

    res.writeHead(404);
    res.end();
}
