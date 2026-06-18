import { Module } from '@nestjs/common';
import { S3Service } from './aws.service';

@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class AwsModule {}
