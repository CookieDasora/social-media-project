import {
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
} from "@nestjs/common";

export const UploadImageValidator = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({
			maxSize: 1024 * 1024,
			message: "File too big. Max 1MB.",
		}),
		new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }), // File extension validation
	],
});
