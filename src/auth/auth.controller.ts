import { Public } from "@common/decorators/public.decorator";
import { ZodExceptionFilter } from "@common/filters/zod-exception.filter";
import {
	Body,
	Controller,
	HttpCode,
	Patch,
	Post,
	Request,
	UseFilters,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RefreshTokenDTO } from "./dto/refresh-token.dto";
import { SignInUserDTO } from "./dto/sign-in.dto";
import { SignUpUserDTO } from "./dto/sign-up.dto";
import { UpdateEmailDTO } from "./dto/update-email.dto";
import { UpdatePasswordDTO } from "./dto/update-password.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import {
	InvalidTokenResponse,
	LoginResponse,
	SignUpErrors,
	UnauthorizedResponse,
} from "./schemas/responses.schema";

@UseFilters(ZodExceptionFilter)
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post("/sign_in")
	@ApiOperation({
		summary: "Authenticates a user",
		description: `
		  Upon successful authentication, it returns an "accessToken" and a "refreshToken":
		  
		  accessToken: A short-lived token used for accessing protected resources.
		  refreshToken: A long-lived token used to renew the accessToken without re-authentication.
		`,
	})
	@ApiOkResponse({
		status: 200,
		description: "Authenticated successfully",
		example: LoginResponse,
	})
	@ApiUnauthorizedResponse({
		description: "Wrong username or password",
		example: UnauthorizedResponse,
	})
	@HttpCode(200)
	async signIn(@Request() req, @Body() _: SignInUserDTO) {
		return this.authService.login(req.user);
	}

	@Public()
	@Post("refresh")
	@ApiOperation({
		summary: "Refreshes the access token",
		description: "Generates a new 'accessToken' using a valid 'refreshToken'",
	})
	@ApiOkResponse({
		status: 200,
		description: "Access token refreshed successfully",
		example: LoginResponse,
	})
	@ApiUnauthorizedResponse({
		description: "Invalid or expired refresh token",
		example: InvalidTokenResponse,
	})
	async refresh(@Request() req, @Body() { refreshToken }: RefreshTokenDTO) {
		return this.authService.refresh(refreshToken);
	}

	@Public()
	@Post("/sign_up")
	@ApiOperation({
		summary: "Creates a new user account",
		description: `
	  The request body must include the following fields:
	  
	  username: A unique alphanumeric string.
	  email: A unique and valid email address.
	  password: A strong password that meets the following criteria:
	    At least 8 characters long.
	    Contains at least one uppercase letter.
	    Includes at least one numeric digit.
	    Has at least one special character (e.g., @, #, $, etc.).  
	    
	  All fields are required.
	`,
	})
	@ApiCreatedResponse({ description: "Account created successfully" })
	@ApiBadRequestResponse({
		description: `
		  The request failed due to one of the following reasons:
		    The username or email is already in use.
		    Validation errors occurred in the provided fields
		`,
		content: {
			"application/json": {
				examples: SignUpErrors,
			},
		},
	})
	async signUp(@Body() signUpUserDto: SignUpUserDTO) {
		return this.authService.signUp(signUpUserDto);
	}

	@Patch("/update_email")
	@ApiOperation({ summary: "Updates the email of the logged-in user" })
	@ApiOkResponse({
		description: "Email updated successfully",
		example: { message: "Email updated successfully" },
	})
	@ApiBadRequestResponse({ description: "Email already in use / Empty field" })
	@ApiUnauthorizedResponse({
		description: "Missing authentication token",
		example: UnauthorizedResponse,
	})
	@ApiBearerAuth("JWT")
	async updateEmail(@Body() { email }: UpdateEmailDTO, @Request() req) {
		return this.authService.updateEmail(req.user.id, email);
	}

	@Patch("/update_password")
	@ApiOperation({ summary: "Updates the password of the logged-in user" })
	@ApiOkResponse({ description: "Password updated successfully" })
	@ApiBadRequestResponse({ description: "Wrong password" })
	@ApiUnauthorizedResponse({
		description: "Missing authentication token",
		example: UnauthorizedResponse,
	})
	@ApiBearerAuth("JWT")
	async updatePassword(
		@Body() { old_password, new_password }: UpdatePasswordDTO,
		@Request() req,
	) {
		return this.authService.updatePassword(
			req.user.id,
			old_password,
			new_password,
		);
	}
}
