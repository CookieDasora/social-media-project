import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { EmailTemplate, TemplateService } from "./template.service";

/*
* Example:

import {
	EmailTemplate,
	EmailType,
} from "@common/services/mail/template.service";

export class ConfirmSignup extends EmailTemplate<{ username: string }> {
	name = EmailType.confirmSignUp;
}

const emailTemplate = new ConfirmSignup({ username: user.username });
await this.mailService.sendEmailFromTemplate(emailTemplate, user.email);
* */

@Injectable()
export class MailService {
	constructor(
		private readonly mailService: MailerService,
		private readonly templateService: TemplateService,
	) {}

	async sendEmailFromTemplate<T>(template: EmailTemplate<T>, to: string) {
		const { html, metadata } = await this.templateService.getTemplate(template);

		return this.mailService.sendMail({
			to,
			subject: metadata.subject,
			html,
		});
	}
}
