import {
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { Todo } from "./Todo";

@Entity("todoitems")
export class TodoItem extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column()
	text: string;

	@Column({ default: false })
	completed: boolean;

	@ManyToOne(() => Todo, (todo) => todo.items)
	@JoinColumn()
	todo: Todo;

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
