import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getHello(): string {
    return 'Hello World Auth Service Ver. 14';
  }
}
