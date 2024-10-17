import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class TimeSlot {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'timestamp' })
    timeSlotStart: string

    @Column({ type: 'timestamp' })
    timeSlotEnd: string

    @Column()
    clinicID: string

    @Column()
    dentistID: string

    @Column({ nullable: true })
    patientID: string
}
