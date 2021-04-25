import {
	Column,
	BaseEntity,
	Entity,
	BeforeInsert,
	PrimaryColumn,
	OneToMany,
} from "typeorm";

import { v4 as uuid } from "uuid";
import { Page } from "./Page";
@Entity("users")
export class User extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@Column()
	email: string;

	@Column()
	username: string;

	@Column({ select: false })
	password: string;

	@Column({ nullable: true }) // should never be null because of @BeforeInsert always sets a default avatar.
	avatar: string;

	@Column({ unique: true })
	slug: string;

	@OneToMany(() => Page, (page) => page.owner)
	pages: Page[];

	@BeforeInsert()
	setDefaultAvatar() {
		this.avatar = `https://ui-avatars.com/api/?name=${this.username}&color=7F9CF5&background=EBF4FF`;
	}

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
