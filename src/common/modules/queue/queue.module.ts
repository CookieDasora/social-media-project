import { MailService } from "@common/modules/mail/mail.service";
import { TemplateService } from "@common/modules/mail/template.service";
import { QueueConsumer } from "@common/modules/queue/queue.consumer";
import { QueueProducer } from "@common/modules/queue/queue.producer";
import { Module } from "@nestjs/common";

@Module({
	providers: [QueueProducer, QueueConsumer, MailService, TemplateService],
	exports: [QueueProducer],
})
export class QueueModule {}
