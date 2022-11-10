import {Request, Response } from 'express';

export function deleteHandler(req:Request, res:Response) {
    res.end('change status to trash');
}
