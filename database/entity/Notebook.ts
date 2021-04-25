import {
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { NotebookBlock } from "./NotebookBlock";

@Entity("notebooks")
export class Notebook extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@Column()
	title: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => NotebookBlock, (notebookBlock) => notebookBlock.notebook)
	blocks: NotebookBlock[];

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
