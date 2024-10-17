import {
    Entity,
    BaseEntity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('notification')
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    userId: string

    @Column()
    message: string

    @Column()
    email: string

    @Column({ default: false })
    isRead: boolean

    @CreateDateColumn()
    createdAt: Date
}
