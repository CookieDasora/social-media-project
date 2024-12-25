import { Public } from "@common/decorators/public.decorator";
import { MultiFileValidation } from "@common/validators/multi_file.validator";
import { File, FilesInterceptor } from "@nest-lab/fastify-multer";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Request,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { UpdateCommentDTO } from "./dto/comments/update_comment.dto";
import { AttachmentsSchema } from "./schemas/attachments.schema";

@ApiTags("Kweeks")
@Controller("kweeks")
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post(":id/comments")
	@ApiConsumes("multipart/form-data")
	@ApiBody(AttachmentsSchema)
	@UseInterceptors(FilesInterceptor("attachments", 4))
	@ApiOperation({ summary: "Creates a comment" })
	@ApiBearerAuth("JWT")
	@ApiBadRequestResponse({ description: "Content too long" })
	create(
		@UploadedFiles(new MultiFileValidation()) attachments: Array<File>,
		@Body() body,
		@Request() req,
		@Param("id") id: string,
	) {
		return this.commentsService.create(
			id,
			body.content,
			req.user.id,
			attachments,
		);
	}

	@Public()
	@Get("comments/:comment_id")
	@ApiOperation({ summary: "Retrieves information about a comment" })
	comment(@Param("comment_id") comment_id: string) {
		return this.commentsService.info(comment_id);
	}

	@Patch(":id/comments/:comment_id")
	@ApiOperation({ summary: "Updates a comment content" })
	@ApiBearerAuth("JWT")
	updateComment(
		@Param("comment_id") comment_id: string,
		@Request() req,
		@Body() body: UpdateCommentDTO,
	) {
		return this.commentsService.update(comment_id, req.user.id, body.content);
	}

	@Delete("comments/:comment_id")
	@ApiOperation({ summary: "Deletes a comment" })
	@ApiBearerAuth("JWT")
	removeComment(@Param("comment_id") comment_id: string, @Request() req) {
		return this.commentsService.delete(comment_id, req.user.id);
	}

	@Post("comments/:comment_id/like")
	@ApiOperation({ summary: "Likes a comment" })
	@ApiBearerAuth("JWT")
	likeComment(@Param("comment_id") comment_id: string, @Request() req) {
		return this.commentsService.like(comment_id, req.user.id);
	}
}
