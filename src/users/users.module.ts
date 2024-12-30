import { S3Service } from "@common/modules/s3/s3.service";
import { Module } from "@nestjs/common";
import { UsersRepository } from "./repository/users.repository";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
	controllers: [UserController],
	providers: [UserService, S3Service, UsersRepository],
	exports: [UserService],
})
export class UserModule {}
