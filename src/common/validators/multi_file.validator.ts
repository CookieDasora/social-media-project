import { File } from "@nest-lab/fastify-multer";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { fromBuffer } from "file-type";

@Injectable()
export class MultiFileValidation implements PipeTransform {
	async transform(value: Array<File>) {
		const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

		const errors = [];

		for (let i = 0; i < value.length; i++) {
			const file = value[i];
			const { buffer, size } = file;

			try {
				const buffer_type = await fromBuffer(buffer);

				if (!buffer_type || !ALLOWED_MIMES.includes(buffer_type.mime)) {
					errors.push({
						file: i + 1,
						error: "Invalid file type. Should be jpeg, png or webp",
					});
				}

				const maxFileSize = 1024 * 1024;

				if (size > maxFileSize) {
					errors.push({ file: i + 1, error: "File is too big. Max 1MB" });
				}
			} catch (e) {
				errors.push({ file: i + 1, error: e.message });
			}
		}

		if (errors.length === 0) {
			return value;
		}

		throw new BadRequestException(errors);
	}
}
