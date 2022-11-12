import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class CronTrack {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('timestamp')
    lastUpdate!: Date;

    @Column('varchar', { length: 100 })
    lastFile!: string;
}
