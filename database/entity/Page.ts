import {
	AfterLoad,
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
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

	@ManyToOne(() => User, (owner) => owner.pages, { onDelete: "CASCADE" })
	@JoinColumn({ name: "ownerId" })
	owner: User;

	@ManyToMany(() => User, { cascade: true, onDelete: "CASCADE" })
	@JoinTable()
	members: User[];

	@OneToMany(() => Todo, (todo) => todo.page, { nullable: true })
	todos: Todo[];

	@OneToMany(() => Notebook, (notebook) => notebook.page, { nullable: true })
	notebooks: Notebook[];

	@Column({
		nullable: false,
		default: PageType.notebook,
	})
	type: string;

	@Column({
		type: "simple-json",
		nullable: true,
		default: JSON.stringify({ active: false, height: 0, url: "" }),
	})
	banner: { active: boolean; height: number; url: string };

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
