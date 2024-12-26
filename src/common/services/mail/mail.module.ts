import { TemplateService } from "@common/services/mail/template.service";
import { MailerService } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
	providers: [MailService, MailerService, TemplateService],
	exports: [MailService, TemplateService],
})
export class MailModule {}
