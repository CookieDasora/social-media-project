import { MailerService } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
	providers: [MailService, MailerService],
	exports: [MailService],
})
export class MailModule {}
