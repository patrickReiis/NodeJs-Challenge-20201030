import * as dotenv from 'dotenv'; 
dotenv.config();
import { DataSource } from 'typeorm';
import { Product } from './entity/Product';
import { CronTrack } from './entity/CronTrack';

export const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'food_challenge',
    synchronize: true,
    logging: false,
    entities: [Product, CronTrack],
    subscribers: [],
    migrations: [],
})
