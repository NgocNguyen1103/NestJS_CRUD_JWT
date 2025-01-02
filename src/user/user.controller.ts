import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { userInfo } from 'os';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.jwt.guard';

@Controller('user')
export class UserController {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {      
        return req.user
    }
}
