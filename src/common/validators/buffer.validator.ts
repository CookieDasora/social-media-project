import { File } from "@nest-lab/fastify-multer";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { fromBuffer } from "file-type";

/**
 * Magic Number validation with `file-type` module.
 */
@Injectable()
export class BufferValidator implements PipeTransform {
	async transform(value: File) {
		const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
		const buffer_type = await fromBuffer(value.buffer);

		if (!buffer_type || !ALLOWED_MIMES.includes(buffer_type.mime)) {
			throw new BadRequestException(
				"Invalid file type. Should be jpeg, png or webp",
			);
		}

		return value;
	}
}
