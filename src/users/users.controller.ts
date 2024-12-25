import { Public } from "@common/decorators/public.decorator";
import { BufferValidator } from "@common/validators/buffer.validator";
import { UploadImageValidator } from "@common/validators/upload_image.validator";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Request,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { FollowUserDTO } from "./dto/follow_user.dto";
import { UpdateNameDTO } from "./dto/update_name.dto";
import { UserService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}
	// POST
	@Post("/follow")
	@ApiOperation({ summary: "Follow/unfollow a user" })
	@ApiCreatedResponse({ description: "Followed/unfollowed successfully" })
	@ApiNotFoundResponse({ description: "User to follow not found" })
	@ApiUnauthorizedResponse({ description: "Missing authentication token" })
	@ApiBearerAuth("JWT")
	follow(@Body() { username }: FollowUserDTO, @Request() req) {
		return this.userService.follow(req.user.id, username);
	}

	// GET
	@Get("/profile")
	@ApiOperation({ summary: "Returns information about the logged-in user" })
	@ApiBearerAuth("JWT")
	@ApiUnauthorizedResponse({
		description: "Missing authentication token",
	})
	me(@Request() req) {
		return req.user;
	}

	@Public()
	@Get(":username")
	@ApiOperation({ summary: "Returns information about a user" })
	@ApiNotFoundResponse({ description: "User not found" })
	@HttpCode(200)
	info(@Param("username") username: string) {
		return this.userService.info(username);
	}

	// PATCH
	@Patch()
	@ApiOperation({
		summary: "Updates the username / display name of the logged-in user",
	})
	@ApiBadRequestResponse({
		description: "Username already in use / Empty field",
	})
	@ApiOkResponse({ description: "Username updated successfully" })
	@ApiUnauthorizedResponse({ description: "Missing authentication token" })
	@ApiBearerAuth("JWT")
	updateName(@Body() { username, displayName }: UpdateNameDTO, @Request() req) {
		return this.userService.updateName(req.user.id, username, displayName);
	}

	@Patch("/image")
	@ApiOperation({
		summary: "Add a profile image",
	})
	@ApiBearerAuth("JWT")
	@UseInterceptors(FileInterceptor("image"))
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		required: true,
		schema: {
			type: "object",
			properties: {
				image: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	uploadProfileImage(
		@UploadedFile(
			UploadImageValidator,
			new BufferValidator(), // Magic number validation
		)
		image: File,
		@Request() req,
	) {
		return this.userService.uploadImage(req.user.id, image);
	}

	// DELETE
	@Delete()
	@ApiOperation({ summary: "Deletes the account of a logged user" })
	@ApiOkResponse({ description: "Account deleted successfully" })
	@ApiUnauthorizedResponse({ description: "Missing authentication token" })
	@ApiBearerAuth("JWT")
	delete(@Request() req) {
		return this.userService.delete(req.user.id);
	}
}
