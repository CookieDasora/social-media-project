import * as path from "node:path";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
	constructor(private readonly mailService: MailerService) {}

	async confirmSignUp() {
		await this.mailService.sendMail({
			to: "",
			subject: "Confirm your email",
		});
	}

	async forgotPassword() {
		await this.mailService.sendMail({
			to: "",
			subject: "Password Reset",
		});
	}

	async updatedEmail() {
		await this.mailService.sendMail({
			to: "",
			subject: "Your email has been changed",
		});
	}

	async updatedPassword() {
		await this.mailService.sendMail({
			to: "",
			subject: "Your password has been changed",
		});
	}

	async twoStepVerification() {
		await this.mailService.sendMail({
			to: "",
			subject: "Your 2-step verification code",
		});
	}
}
