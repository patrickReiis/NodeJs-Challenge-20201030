import { Request, Response } from 'express';
import { dataSource } from '../db/get-data-source';
import { Product } from '../db/entity/Product';
import { allowedKeys } from '../cron/execute';
import { doesUserExist } from '../utils';

export async function updateProductHandler(req:Request, res:Response) {
    
    if (areKeysAllowed(req.body) == false) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'As suas keys não são validas. Consulte a documentação para entender erro.'}));
        return 
    }

    if (await doesUserExist(req.url.slice('/products/'.length)) == true) {
        const productCode = decodeURIComponent(req.url.slice('/products/'.length));
        const product = await dataSource
            .query(`select * from product where food -> 'code' ? '${productCode}'`);

        for (const key of Object.keys(req.body)) {
            if (key == 'status' ) {
                product[0].status = req.body?.status;
            }

            product[0].food[key] = req.body[key];

        }
        await dataSource.getRepository(Product).save(product);
        res.writeHead(200);
        res.end()
        return
    }

    res.writeHead(404);
    res.end();
}

function areKeysAllowed(body: object):boolean {
    // cannot update code key and imported_t
    const keysWithoutCode = allowedKeys.filter(e => e != 'code' && e != 'imported_t');

    const bodyKeys = Object.keys(body);

    if (bodyKeys.length > keysWithoutCode.length) return false; 

    for (const element of bodyKeys) {
        if ((keysWithoutCode as Array<string>).includes(element) == false) {
            return false
        }
    }

    const statusValuesAllowed = ['published', 'trash', 'draft'];
    if ('status' in body == true) {
        if (statusValuesAllowed.includes((body as any)['status']) == false) {
            return false
        }
    }

    return true 
}
