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
import { Notebook } from "./Notebook";

enum NotebookBlockType {
	image = "image",
	richText = "richText",
	code = "code",
}

@Entity("notebookblocks")
export class NotebookBlock extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@Column("simple-json", { nullable: true })
	content: string;

	@Column({ nullable: false })
	type: NotebookBlockType;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => Notebook, (notebook) => notebook.blocks, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "notebookId" })
	notebook: Notebook;

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
