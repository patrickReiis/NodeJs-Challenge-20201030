import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', {length: 10} )
    status!: 'published'|'trash'|'draft';

    @Column('jsonb')
    food!: { [k:string]: string|number };
}
