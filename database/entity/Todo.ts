import {
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { Page } from "./Page";
import { TodoItem } from "./TodoItem";

@Entity("todos")
export class Todo extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ nullable: true, default: "My todo block" })
	title: string;

	@Column({ default: false })
	completed: boolean;

	@OneToMany(() => TodoItem, (todoItem) => todoItem.todo)
	items: TodoItem[];

	@ManyToOne(() => Page, (page) => page.todos)
	page: Page;

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
