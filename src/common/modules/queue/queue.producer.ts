import { Environment } from "@/environment";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import amqp, { ChannelWrapper } from "amqp-connection-manager";
import { Channel } from "amqplib";
import { EmailTemplate } from "../mail/template.service";

@Injectable()
export class QueueProducer {
	private channelWrapper: ChannelWrapper;
	constructor() {
		const connection = amqp.connect([Environment.env.RABBITMQ_ENDPOINT]);
		this.channelWrapper = connection.createChannel({
			setup: (channel: Channel) => {
				return channel.assertQueue("emailQueue", { durable: true });
			},
		});
	}

	async addEmailToQueue<T>(template: EmailTemplate<T>, to: string) {
		try {
			await this.channelWrapper.sendToQueue(
				"emailQueue",
				Buffer.from(
					JSON.stringify({
						template: template.toJSON(),
						to,
					}),
				),
				{
					persistent: true,
				},
			);
		} catch (e) {
			throw new InternalServerErrorException("Failed to add email to queue");
		}
	}
}
