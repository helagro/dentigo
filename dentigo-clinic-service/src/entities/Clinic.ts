import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Clinic {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    email: string

    @Column()
    name: string

    @Column({ nullable: true })
    image: string

    @Column()
    address: string

    @Column({ nullable: true, type: 'float' })
    latitude: number

    @Column({ nullable: true, type: 'float' })
    longitude: number
}
