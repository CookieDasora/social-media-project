import { Environment } from "@/environment";
import { TemplateService } from "@common/modules/mail/template.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: Environment.env.EMAIL_HOST,
				port: Number(Environment.env.EMAIL_PORT),
				auth: {
					user: Environment.env.EMAIL_ID,
					pass: Environment.env.EMAIL_PASS,
				},
			},
			defaults: {
				from: `Project Knedita <${Environment.env.EMAIL_ID}>`,
			},
		}),
	],
	providers: [MailService, TemplateService],
	exports: [MailService, TemplateService],
})
export class MailModule {}
