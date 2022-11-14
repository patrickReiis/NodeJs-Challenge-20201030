import { Request, Response } from 'express';
import { dataSource } from '../db/get-data-source';
import { Product } from '../db/entity/Product';
import { allowedKeys } from '../cron/execute';

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

        for (const key of Object.keys(req.body)) { //typeerro
            if (key == 'imported_t' ) {
                product[0].imported_t = req.body?.imported_t;
            }
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

async function doesUserExist(productCode:string):Promise<boolean> {
    productCode = decodeURIComponent(productCode); 
    try {
        const product = await dataSource
            .query(`select * from product where food -> 'code' ? '${productCode}'`);

        if (product.length == 0) {
            return false
        }

        return true
    }

    catch (e) {
        console.log(e);
        return false
    }
}

function areKeysAllowed(body: object):boolean {
    // cannot update code key
    const keysWithoutCode = allowedKeys.filter(e => e != 'code');

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
