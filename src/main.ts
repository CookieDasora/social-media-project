import helmet from "@fastify/helmet";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { patchNestJsSwagger } from "nestjs-zod";
import { AppModule } from "./app.module";
import { Configuration } from "./configuration";

/*
  --- Present ---

  TODO: Send e-mails to the user when something happens to his account.
  TODO: Improve documentation (specially in Kweek module)
  TODO: Better authentication (Add OAuth e.g.)
  TODO: Add pagination on some queries
  TODO: Generate a signed url instead of returning a s3 link 
  TODO: Create the chat system.
        -> Initialize the websocket system first.
*/

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({ logger: Configuration.NODE_ENV() === "dev" }),
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
		.setVersion("1.1a")
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

	await app.register(helmet);

	await app.listen(Configuration.SERVER_PORT(), Configuration.SERVER_HOST());
}
bootstrap();
