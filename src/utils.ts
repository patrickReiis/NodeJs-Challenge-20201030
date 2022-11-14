import { dataSource } from './db/get-data-source';

export async function doesUserExist(productCode:string):Promise<boolean> {
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
