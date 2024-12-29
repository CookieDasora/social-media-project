import { readFile } from "node:fs/promises";
import path from "node:path";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import * as Handlebars from "handlebars";
import mjml from "mjml";

export enum EmailType {
	confirmSignUp = "confirm-signup",
	emailUpdated = "email-updated",
	forgotPassword = "forgot-password",
	passwordUpdated = "password-updated",
	twoStepVerification = "two-step-verification",
}

export type EmailMetadata = {
	subject: string;
};

export abstract class EmailTemplate<T> {
	constructor(public context: T) {}
	public name: EmailType;
	get data(): T | unknown {
		return this.context;
	}
}

export interface BuiltTemplate {
	html: string;
	metadata: {
		subject: string;
	};
}

@Injectable()
export class TemplateService {
	private readonly logger = new Logger(TemplateService.name);
	/**
	 * Get the template and render with the dynamic content
	 * */
	async getTemplate<T>({
		name,
		data,
	}: EmailTemplate<T>): Promise<BuiltTemplate> {
		try {
			const result = await this.getEmailTemplate(name);
			const template = Handlebars.compile<typeof data>(result.html);
			const html = template(data);
			const metadata = await this.getEmailData(name);
			return { html, metadata };
		} catch (e) {
			this.logger.error("Error reading email template: %s", e.message());
		}
	}

	/**
	 * Read the MJML template and return the parsed template.
	 */
	async getEmailTemplate(
		template: EmailType,
	): Promise<ReturnType<typeof mjml>> {
		try {
			const file = await readFile(
				this.resolveTemplatePath(template, "mjml"),
				"utf8",
			);
			return mjml(file);
		} catch (e) {
			this.logger.error("Error reading template: %s", e.message());
			throw new InternalServerErrorException();
		}
	}

	/**
	 * Read the JSON file which contains the email's metadata
	 * */
	async getEmailData(template: EmailType): Promise<EmailMetadata> {
		try {
			const contents = await readFile(
				this.resolveTemplatePath(template, "json"),
				"utf8",
			);
			return JSON.parse(contents);
		} catch (e) {
			this.logger.error("Error reading template: %s", e.message());
			throw new InternalServerErrorException();
		}
	}

	private resolveTemplatePath(template: EmailType, extension: string): string {
		return path.resolve(__dirname, `./templates/${template}.${extension}`);
	}
}
