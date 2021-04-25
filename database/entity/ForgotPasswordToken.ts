import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	OneToOne,
	JoinColumn,
	BeforeInsert,
} from "typeorm";
import { User } from "./User";

import { v4 as uuid } from "uuid";

@Entity("forgotpasswordtokens")
export class ForgotPasswordToken extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column({
		unique: true,
		nullable: false,
	})
	token: string;

	@CreateDateColumn()
	createdAt: Date;

	@OneToOne(() => User)
	@JoinColumn({ name: "userId" })
	user: User;

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
