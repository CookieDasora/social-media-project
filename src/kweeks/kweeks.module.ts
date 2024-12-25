import { UsersRepository } from "@/users/repository/users.repository";
import { S3Service } from "@common/services/s3/s3.service";
import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { KweeksController } from "./kweeks.controller";
import { KweeksService } from "./kweeks.service";
import { CommentsRepository } from "./repository/comments.repository";
import { KweeksRepository } from "./repository/kweeks.repository";

@Module({
	controllers: [KweeksController, CommentsController],
	providers: [
		KweeksService,
		S3Service,
		CommentsService,
		UsersRepository,
		CommentsRepository,
		KweeksRepository,
	],
})
export class KweeksModule {}
