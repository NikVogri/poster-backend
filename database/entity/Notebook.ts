import { appendFileSync } from "fs";
import {
	AfterLoad,
	BaseEntity,
	BeforeInsert,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { NotebookBlock } from "./NotebookBlock";
import { Page } from "./Page";

@Entity("notebooks")
export class Notebook extends BaseEntity {
	@PrimaryColumn()
	id: string;

	@Column({ nullable: true, default: "My notebook page" })
	title: string;

	@Column({
		type: "simple-json",
		nullable: true,
		default: { active: false, height: 0, url: "" },
	})
	banner: { active: boolean; height: number; url: string };

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => Page, (page) => page.todos)
	page: Page;

	@OneToMany(() => NotebookBlock, (notebookBlock) => notebookBlock.notebook)
	blocks: NotebookBlock[];

	@BeforeInsert()
	setId() {
		this.id = uuid();
	}
}
