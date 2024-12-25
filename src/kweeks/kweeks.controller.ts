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
import { UpdateKweekDTO } from "./dto/kweeks/update_kweek.dto";
import { KweeksService } from "./kweeks.service";
import { AttachmentsSchema } from "./schemas/attachments.schema";

@ApiTags("Kweeks")
@Controller("kweeks")
export class KweeksController {
	constructor(private readonly kweeksService: KweeksService) {}

	@Post()
	@ApiConsumes("multipart/form-data")
	@ApiBody(AttachmentsSchema)
	@UseInterceptors(FilesInterceptor("attachments", 4))
	@ApiOperation({ summary: "Creates a kweek" })
	@ApiBearerAuth("JWT")
	@ApiBadRequestResponse({ description: "Content too long" })
	create(
		@UploadedFiles(new MultiFileValidation()) attachments: Array<File>,
		@Body() body,
		@Request() req,
	) {
		return this.kweeksService.create(body.content, req.user.id, attachments);
	}

	@Public()
	@Get(":id")
	@ApiOperation({ summary: "Retrieves information about a kweek" })
	findOne(@Param("id") id: string) {
		return this.kweeksService.findOne(id);
	}

	@Patch()
	@ApiOperation({ summary: "Updates a kweek content" })
	@ApiBearerAuth("JWT")
	update(@Body() body: UpdateKweekDTO, @Request() req) {
		return this.kweeksService.update(req.user.id, body.post_id, body.content);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Deletes a kweek" })
	@ApiBearerAuth("JWT")
	remove(@Param("id") id: string, @Request() req) {
		return this.kweeksService.remove(req.user.id, id);
	}

	@Post(":id/like")
	@ApiOperation({ summary: "Likes a kweek" })
	@ApiBearerAuth("JWT")
	likeKweek(@Param("id") kweek_id: string, @Request() req) {
		return this.kweeksService.like(req.user.id, kweek_id);
	}
}
