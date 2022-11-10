import {Request, Response } from 'express';

export function statusHandler(req:Request, res:Response) {
    res.end('cron status');
}

export function listProductsHandler(req:Request, res:Response) {
    res.end('get all (with pagination)');
}

export function specificProductHandler(req:Request, res:Response) {
    res.end('only one product');
}
