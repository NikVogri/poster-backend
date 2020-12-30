import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  BeforeInsert,
} from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true }) // should never be null because of @BeforeInsert always sets a default avatar.
  avatar: string;

  @Column({
    unique: true,
  })
  slug: string;

  @BeforeInsert()
  setDefaultAvatar() {
    this.avatar = `https://ui-avatars.com/api/?name=${this.username}&color=7F9CF5&background=EBF4FF`;
  }
}
