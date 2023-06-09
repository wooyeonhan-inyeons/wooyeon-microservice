import { ApiProperty } from '@nestjs/swagger';

export class ResponseLoadAllCommentsDto {
  @ApiProperty()
  comment_id: string;

  @ApiProperty()
  post_id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  created_at: Date;
}
