import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Dentist {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ nullable: true })
    image: string

    @Column()
    description: string

    @Column({ nullable: true })
    clinicID: string
}
