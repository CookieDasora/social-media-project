import {
	EmailTemplate,
	EmailType,
} from "@common/modules/mail/template.service";

export class ConfirmSignup extends EmailTemplate<{ username: string }> {
	name = EmailType.confirmSignUp;
}

export class EmailUpdated extends EmailTemplate<{ unknown }> {
	name = EmailType.emailUpdated;
}

export class ForgotPassword extends EmailTemplate<{ unknown }> {
	name = EmailType.forgotPassword;
}

export class PasswordUpdated extends EmailTemplate<{ unknown }> {
	name = EmailType.passwordUpdated;
}

export class TwoStepVerification extends EmailTemplate<{ code: string }> {
	name = EmailType.twoStepVerification;
}
