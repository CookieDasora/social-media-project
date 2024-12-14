import helmet from "@fastify/helmet";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { patchNestJsSwagger } from "nestjs-zod";
import { AppModule } from "./app.module";
import { Configuration } from "./configuration";

/*
  --- Present ---

  TODO: Send e-mails to the user when something happens to his account.
  TODO: Improve documentation
  TODO: Fix Dockerfile
  TODO: Remove unnecessary files
  TODO: Better intellisense
  TODO: Better authentication (Add OAuth e.g.)
  TODO: Create the chat system.
        -> Initialize the websocket system first.
*/

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({ logger: process.env.NODE_ENV === "dev" }),
	);

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
	});

	patchNestJsSwagger();

	app.enableCors();

	const config = new DocumentBuilder()
		.setTitle("Project Knedita")
		.setDescription("An open-source social media")
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "JWT",
				description: "Enter JWT Token",
				in: "header",
			},
			"JWT",
		)
		.addTag("Auth")
		.addTag("Kweeks")
		.addTag("Users")
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("/", app, document);

	app.use(
		"/v1/reference",
		apiReference({
			withFastify: true,
			theme: "mars",
			spec: {
				content: document,
			},
		}),
	);

	await app.register(helmet);

	await app.listen(Configuration.SERVER_PORT(), Configuration.SERVER_HOST());
}
bootstrap();
