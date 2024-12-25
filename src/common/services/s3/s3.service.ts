import { Environment } from "@/environment";
import {
	DeleteObjectsCommand,
	PutObjectCommand,
	PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { File } from "@nest-lab/fastify-multer";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import sharp from "sharp";

/*
 *  TODO: Reformulate the upload file system
 *        We need to store the S3 bucket and key of the file
 *        And then generate a signed url of the file on the front-end
 * */

@Injectable()
export class S3Service {
	private bucket: string = Environment.env.MINIO_DEFAULT_BUCKETS;
	private endpoint: string = Environment.env.MINIO_ENDPOINT;

	constructor(@InjectS3() private readonly s3: S3) {}

	/**
	 * Returns the image url if the upload was successful.
	 */
	async uploadImage(userID: string, buffer: Buffer): Promise<string> {
		const compressedBuffer = await sharp(buffer)
			.resize(200, 200)
			.webp({ quality: 70 })
			.toBuffer();

		const params: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key: `profile_images/${userID}.webp`,
			Body: compressedBuffer,
			ContentType: "image/webp",
			ContentDisposition: "inline",
			ACL: "public-read",
		};

		const { ETag } = await this.s3.send(new PutObjectCommand(params));

		if (ETag !== null) {
			return `${this.endpoint}/${this.bucket}/profile_images/${userID}.webp`;
		}

		throw new InternalServerErrorException(
			"Failed to upload the profile image",
		);
	}

	async multiImageUpload(id: string, files: Array<File>) {
		const buffers: Buffer[] = [];

		if (files.length === 0) {
			return [];
		}

		for (let i = 0; i < files.length; i++) {
			const { buffer } = files[i];

			const compressedBuffers = await sharp(buffer)
				.webp({ quality: 70 })
				.toBuffer();
			buffers.push(compressedBuffers);
		}

		const uploadPromises = buffers.map(async (buffer, index) => {
			return await this.multiUpload(buffer, id, index + 1);
		});

		return Promise.all(uploadPromises);
	}

	private async multiUpload(buffer: Buffer, id: string, index: number) {
		const Key = `posts/${id}/${index}.webp`;

		const params: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key,
			Body: buffer,
			ContentType: "image/webp",
		};

		await this.s3.send(new PutObjectCommand(params));
		return `${this.endpoint}/${this.bucket}/${Key}`;
	}

	async deleteFiles(attachments: string[]) {
		if (attachments.length === 0) {
			return;
		}

		const keys = attachments.map((url) => {
			try {
				const parsed_url = new URL(url);
				let key = parsed_url.pathname.substring(1);

				if (key.startsWith(`${this.bucket}/`)) {
					key = key.replace(`${this.bucket}`, "");
				}

				return key;
			} catch (e) {
				throw new InternalServerErrorException("Failed to parse URL");
			}
		});

		const command = new DeleteObjectsCommand({
			Bucket: this.bucket,
			Delete: {
				Objects: keys.map((key) => ({ Key: key })),
			},
		});

		try {
			await this.s3.send(command);
		} catch (error) {
			throw new InternalServerErrorException(
				"Failed to delete files from S3:",
				error,
			);
		}
	}
}
