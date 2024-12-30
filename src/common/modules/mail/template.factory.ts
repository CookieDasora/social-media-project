import {
	EmailTemplate,
	EmailType,
} from "@common/modules/mail/template.service";

// biome-ignore lint/complexity/noStaticOnlyClass: let it be, let it be, let it be, let it be...
export class TemplateFactory {
	static createTemplate<T>(name: EmailType, data: T): EmailTemplate<T> {
		switch (name) {
			case EmailType.confirmSignUp:
				return new (class extends EmailTemplate<T> {
					name = EmailType.confirmSignUp;
				})(data);
			case EmailType.emailUpdated:
				return new (class extends EmailTemplate<T> {
					name = EmailType.emailUpdated;
				})(data);
			case EmailType.forgotPassword:
				return new (class extends EmailTemplate<T> {
					name = EmailType.forgotPassword;
				})(data);
			case EmailType.passwordUpdated:
				return new (class extends EmailTemplate<T> {
					name = EmailType.passwordUpdated;
				})(data);
			case EmailType.twoStepVerification:
				return new (class extends EmailTemplate<T> {
					name = EmailType.twoStepVerification;
				})(data);
		}
	}
}
