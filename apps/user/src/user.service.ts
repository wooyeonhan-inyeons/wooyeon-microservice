import SnsService from '@app/sns/sns.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { RequestCreateUserDto } from './dto/RequestCreateUser.dto';
import { RequestUpdateUserDto } from './dto/RequestUpdateUser.dto';
import { ResponseGetUserDto } from './dto/ResponseGetUser.dto';
import { User } from './entity/user.entity';
import { MessageDTO } from '@app/common/dto/Message.dto';
import { UserNotFoundException } from './exception/UserNotFound.exception';
import { Role } from '@app/common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly snsService: SnsService, // 따로 빼줘야한다
  ) {}

  async create(userData: RequestCreateUserDto) {
    const user = this.usersRepository.create({
      ...userData,
      role: Role.User,
      // category: [CATEGORY.CATEGORY1, CATEGORY.CATEGORY2],
    });
    return await this.usersRepository.save(user);
  }

  async findOne(user_id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        user_id,
      },
    });
    if (!user) throw new UserNotFoundException();
    return user;
  }

  async findOneByEmail(email: string): Promise<ResponseGetUserDto> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new UserNotFoundException();
    return user;
  }

  async update(user_id: string, userData: RequestUpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        user_id,
      },
    });
    if (!user) throw new UserNotFoundException();
    const userToUpdate = { ...user, ...userData };
    return await this.usersRepository.save(userToUpdate);
  }

  async delete(user_id: string): Promise<number> {
    const user = await this.usersRepository.delete(user_id);
    if (user.affected != 0) {
      const message: MessageDTO = {
        user_id,
        target_id: user_id,
        content: '',
      };
      await this.snsService.publishMessage(
        // 어떤 user_id가 삭제됐는지 다른 서비스에 알려야함
        message,
        'user_deleted',
      );
      return 200;
    }
    return 200;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
}
