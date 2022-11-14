import { dataSource } from '../db/get-data-source';
import { CronTrack } from '../db/entity/CronTrack';
import { Product } from '../db/entity/Product';
import { IncomingMessage } from 'http';
const https = require('node:https');
const fs = require('node:fs');
const cron = require('node-cron');
const zlib = require('node:zlib');
const readline = require('node:readline');

// task will happen every hour:minute
export const hour = '18' as const; 
export const minute = '15' as const; 

// number of products that will be imported
const maxImport = 100;

const filesOpenFood = [
     'https://challenges.coode.sh/food/data/json/products_01.json.gz',
     'https://challenges.coode.sh/food/data/json/products_02.json.gz',
     'https://challenges.coode.sh/food/data/json/products_03.json.gz',
     'https://challenges.coode.sh/food/data/json/products_04.json.gz',
     'https://challenges.coode.sh/food/data/json/products_05.json.gz',
     'https://challenges.coode.sh/food/data/json/products_06.json.gz',
     'https://challenges.coode.sh/food/data/json/products_07.json.gz',
     'https://challenges.coode.sh/food/data/json/products_08.json.gz',
     'https://challenges.coode.sh/food/data/json/products_09.json.gz'
] as const;

const allowedKeys =  [
    'code',             'status',
    'imported_t',       'url',
    'creator',          'created_t',
    'last_modified_t',  'product_name',
    'quantity',         'brands',
    'categories',       'labels',
    'cities',           'purchase_places',
    'stores',           'ingredients_text',
    'traces',           'serving_size',
    'serving_quantity', 'nutriscore_score',
    'nutriscore_grade', 'main_category',
    'image_url'
] as const;

type ProductType = { [key:string]: number|string }

const task = cron.schedule(`* ${minute} ${hour} * * *`, async () => {

    const cronRepo = await dataSource.getRepository(CronTrack);

    // There is no data in the CronTrack table, so create one data(row)
    if (await doesLastUpdateExists() === false) { 
        const cron = new CronTrack();
        cron.lastFile = getNextFile(cron.lastFile, true) as string;
        cron.lastUpdate = new Date();
        await cronRepo.save(cron);

        // downloading first file
        downloadFileToDb(cron.lastFile);
    } 
    else {
        const cron = (await dataSource.getRepository(CronTrack).find({}))[0]; // Get first cron row data
        cron.lastUpdate.setUTCMilliseconds(0);
        cron.lastUpdate.setUTCSeconds(0);

        const today = new Date();
        today.setUTCMilliseconds(0);
        today.setUTCSeconds(0);

        // if the date is the same, it means that the data is already up to date, so just return
        if (JSON.stringify(today) == JSON.stringify(cron.lastUpdate)) {
            return
        }
        
        // get next file, if possible
        // if it's the first time downloading a file, get the first file, else get next
        const currentFile = await doesLastUpdateExists() === false ? getNextFile(cron.lastFile, true) : getNextFile(cron.lastFile, false);

        // if it's a boolean it means the last file was already downloaded, so there is not need to download more files.
        if (typeof currentFile == 'boolean') return;

        downloadFileToDb(currentFile);

        cron.lastUpdate = new Date();
        cron.lastFile = currentFile;
        await cronRepo.save(cron);

    }

    console.log('running a task every minute :)');
});

async function doesLastUpdateExists():Promise<boolean> {
    const cronRepo = await dataSource.getRepository(CronTrack);

    const possibleInstance = await cronRepo.find({}); 

    if (possibleInstance.length === 0) return false; // There is no data in the CronTrack table

    return true;
}

function getNextFile(file:string, firstTime:boolean): string|boolean {
    // If it's the first it means that not a single file was downloaded, so get the first file 
    if (firstTime == true) return filesOpenFood[0];


    for (let i = 0; i < filesOpenFood.length; i++) {
        // return next file, if it's not the last
        if (file == filesOpenFood[i] && typeof filesOpenFood[i+1] == 'string') return filesOpenFood[i+1];
    }

    return false;
}

async function downloadFileToDb(currentFile:string) {

    const urlSource = currentFile; // .gz extension
    const destination = fs.createWriteStream('file.gz');

    https.get(urlSource, (streamReadable:IncomingMessage) => {

        // writing data chunks to file
        streamReadable.pipe(destination);

        streamReadable.on('end', () => {
            const fileCompressed = fs.createReadStream(destination.path)
            const fileDecompressed = fs.createWriteStream('file.json');
            const unzip = zlib.createGunzip();

            // writing data chunks to 'file.json'
            const jsonFile = fileCompressed.pipe(unzip).pipe(fileDecompressed);

            jsonFile.on('finish', async () => {
                const productFile = fs.createReadStream('file.json');
                const readStreamLine = readline.createInterface({
                    input: productFile,
                    output: process.stdout,
                    terminal: false
                });

                const productList:ProductType[] = [];
                let numberOfLinesRead = 0;

                readStreamLine.on('line', (lineContent:string) => {
                    if (numberOfLinesRead >= maxImport) {
                        readStreamLine.close();
                        return
                    }

                    productList.push(JSON.parse(lineContent));
                    numberOfLinesRead++;
                });

                readStreamLine.on('close', async () => {

                    // cleaning not wanted properties
                    validateProduct(productList)

                    // saving product to db
                    await saveProduct(productList);

                    // deleting files from server
                    fs.unlink('file.json', (err:Error) => {if (err) throw err});
                    fs.unlink('file.gz', (err:Error) => {if (err) throw err});
                })
            })
        })
    })
}

function validateProduct(productObj:object[]) {
    const productKeysRef:string[] = Object.keys(productObj[0]); // since all product objects have the same properties, I can use only the first element to compare

    for (let i = 0; i < productKeysRef.length; i++) {

        // if the product object has more keys/properties than the allowed keys, remove those properties from the product object
        if (((allowedKeys as unknown) as string[]).includes(productKeysRef[i]) == false ){ 
            productObj.map((e:any) => delete e[productKeysRef[i]]);
        }
    }
}

async function saveProduct(productObj: { [k:string]: string|number } []) {
    const productRepo = dataSource.getRepository(Product);

    for (let i = 0; i < productObj.length; i++) {
        const product = new Product();
        product.food = productObj[i];
        product.status = 'published';
        product.imported_t = new Date();
        await productRepo.save(product);
    }
}
