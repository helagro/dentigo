import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('clinicNotificationSubscription')
export class ClinicNotificationSubscription extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    clinicId: string

    @Column({ nullable: false })
    userEmail: string
}
