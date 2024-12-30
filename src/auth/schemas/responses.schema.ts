export const UnauthorizedResponse = {
	message: "Wrong username or password",
	error: "Unauthorized",
	statusCode: 401,
};

export const InvalidTokenResponse = {
	message: "Invalid refresh token provided",
	error: "Unauthorized",
	statusCode: 401,
};

export const LoginResponse = {
	accessToken: "eyJhbGciOiJIUzI1NiIs...",
	refreshToken: "rsk29ixh03cj...",
};

export const SignUpErrors = {
	InvalidEmail: {
		summary: "Email already in use",
		value: {
			message: "Email already in use",
			error: "Bad Request",
			statusCode: 400,
		},
	},
	InvalidUsername: {
		summary: "Username already in use",
		value: {
			message: "Username already in use",
			error: "Bad Request",
			statusCode: 400,
		},
	},
	InvalidFields: {
		summary: "Failed to validate fields",
		value: {
			message: "Failed to validate some fields",
			errors: [
				{
					message: "Email is required",
				},
			],
			statusCode: 400,
		},
	},
};
