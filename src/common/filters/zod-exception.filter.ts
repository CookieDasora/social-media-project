import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { FastifyReply } from "fastify";
import { ZodValidationException } from "nestjs-zod";

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
	constructor(private httpAdapterHost: HttpAdapterHost) {}

	catch(exception: ZodValidationException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();
		const errors = exception
			.getZodError()
			.errors.map((error) => ({ message: error.message }));

		return this.httpAdapterHost.httpAdapter.reply(
			response,
			{
				status: 400,
				message: "Failed to validate some fields",
				errors,
			},
			400,
		);
	}
}
