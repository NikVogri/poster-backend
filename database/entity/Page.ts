import {
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

import { v4 as uuid } from "uuid";
import { Todo } from "./Todo";
import { Notebook } from "./Notebook";

export enum PageType {
	notebook = "notebook",
	todo = "todo",
}
@Entity("pages")
export class Page extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@Column({ nullable: false })
	title: string;

	@Column({ nullable: false })
	private: boolean;

	@Column({ default: false })
	deleted: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ nullable: false })
	ownerId: string;

	@Column({ nullable: true })
	todoId: string;

	@Column({ nullable: true })
	notebookId: string;

	@ManyToOne(() => User, (owner) => owner.pages)
	@JoinColumn({ name: "ownerId" })
	owner: User;

	@ManyToMany(() => User, { cascade: true })
	@JoinTable()
	members: User[];

	@OneToOne(() => Todo, { nullable: true })
	@JoinColumn({ name: "todoId" })
	todo: Todo;

	@OneToOne(() => Notebook, { nullable: true })
	@JoinColumn({ name: "notebookId" })
	notebook: Notebook;

	@Column({
		nullable: false,
		default: PageType.notebook,
	})
	type: string;

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
