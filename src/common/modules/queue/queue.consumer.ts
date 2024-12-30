import { Environment } from "@/environment";
import { EmailTemplate } from "@common/modules/mail/template.service";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import amqp, { ChannelWrapper } from "amqp-connection-manager";
import { ConfirmChannel } from "amqplib";
import { MailService } from "../mail/mail.service";

@Injectable()
export class QueueConsumer implements OnModuleInit {
	private channelWrapper: ChannelWrapper;
	private readonly logger = new Logger(QueueConsumer.name);

	constructor(private mailService: MailService) {
		const connection = amqp.connect([Environment.env.RABBITMQ_ENDPOINT]);
		this.channelWrapper = connection.createChannel();
	}

	public async onModuleInit() {
		try {
			await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
				await channel.assertQueue("emailQueue", { durable: true });
				await channel.consume("emailQueue", async (message) => {
					if (message) {
						const content = JSON.parse(message.content.toString());
						const template = EmailTemplate.fromJSON(content.template);
						await this.mailService.sendEmailFromTemplate(template, content.to);
						channel.ack(message);
					}
				});
			});
		} catch (e) {
			this.logger.error("Error starting the consumer: %o", e);
		}
	}
}
