import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { RequestCreatePostDto } from './dto/request/CreatePost.dto';
import { JwtAuthGuard } from '@app/common/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guard/roles.guard';
import { HttpService } from '@nestjs/axios';
import { RequestDeletePostDto } from './dto/request/DeletePost.dto';
import { RequestReadPostDto } from './dto/request/ReadPost.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResponseReadNearPostDto } from './dto/response/ReadNearPost.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequestReadNearPostDto } from './dto/request/ReadNearPost.dto';
import { ResponseReadPostDto } from './dto/response/ReadPost.dto';
import { RequestReadViewedPostByMonthDto } from './dto/request/ReadViewedPostByMonth.dto';
import { RequestReadAuthorDto } from './dto/request/ReadAuthor.dto';
import { ResponseReadAuthorDto } from './dto/response/ReadAuthor.dto';
import { HttpServiceInterceptor } from './post.interceptor';
import { ResponseReadViewedPostByMonthDto } from './dto/response/ReadViewedPostByMonth.dto';
import { ResponseReadUploadedPostByMonthDto } from './dto/response/ReadUploadedPostByMonth.dto';

@Controller('/post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly httpService: HttpService,
  ) {}

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: '하나의 우연을 업로드 합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RequestCreatePostDto })
  @UseInterceptors(
    FilesInterceptor('file', null, {
      limits: {
        files: 10,
        fileSize: 1024 * 1024 * 20,
      },
      fileFilter: (request, file, callback) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          // 이미지 형식은 jpg, jpeg, png만 허용합니다.
          callback(null, true);
        } else {
          callback(
            new HttpException(
              '이미지 형식은 jpg, jpeg, png, gif만 허용합니다.',
              400,
            ),
            false,
          );
        }
      },
    }),
  )
  async createPost(
    @Body() body: RequestCreatePostDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user_id = req.user.user_id;
    return await this.postService.createPost(body, user_id, files);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/')
  @UseInterceptors(HttpServiceInterceptor)
  @ApiOperation({
    summary: '하나의 우연을 조회 합니다',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadPostDto,
  })
  async readPost(@Query() query: RequestReadPostDto, @Req() req) {
    const jwt = req.jwt;
    return await this.postService.readPost(query, req.user.user_id, jwt);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/viewed')
  @ApiOperation({
    summary: '달별로 발견한 우연을 조회합니다.',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadViewedPostByMonthDto,
    isArray: true,
  })
  async readViewPostByMonth(
    @Query() query: RequestReadViewedPostByMonthDto,
    @Req() req,
  ) {
    return await this.postService.readViewedPostByMonth(
      query,
      req.user.user_id,
    );
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/uploaded')
  @ApiOperation({
    summary: '달별로 내가 올린 우연을 조회합니다.',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadUploadedPostByMonthDto,
    isArray: true,
  })
  async readUploadedPostByMonth(
    @Query() query: RequestReadViewedPostByMonthDto,
    @Req() req,
  ) {
    return await this.postService.readUploadedPostByMonth(
      query,
      req.user.user_id,
    );
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  async deletePost(@Body() body: RequestDeletePostDto, @Req() req) {
    const user_id = req.user.user_id;
    return await this.postService.deletePost(body, user_id);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/nearAll')
  @ApiOperation({
    summary: '반경 100m 이내의 모든 우연을 조회합니다.',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadNearPostDto,
    isArray: true,
  })
  async readNearPost(@Query() query: RequestReadNearPostDto) {
    return await this.postService.readNearPost(query);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/near')
  @ApiOperation({
    summary: '반경 100m 이내의 모든 우연을 조회합니다. (조회한 우연 제외)',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadNearPostDto,
    isArray: true,
  })
  async readNearPostExceptViewed(
    @Query() query: RequestReadNearPostDto,
    @Req() req,
  ) {
    return await this.postService.readNearPostExceptViewed(
      query,
      req.user.user_id,
    );
  }
  @ApiOperation({
    summary: '해당 우연에 대한 작성자를 조회합니다. (서비스 간 통신 전용)',
  })
  @ApiCreatedResponse({
    status: 200,
    type: ResponseReadAuthorDto,
  })
  @Get('/author')
  async getAuthor(@Query() query: RequestReadAuthorDto) {
    return await this.postService.getAuthor(query);
  }

  @Get('/healthcheck')
  healthCheck(): number {
    return 200;
  }
}
