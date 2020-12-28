import { PrimaryGeneratedColumn, Column, BaseEntity, Entity } from "typeorm";

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

  @Column({
    unique: true,
  })
  slug: string;
}
