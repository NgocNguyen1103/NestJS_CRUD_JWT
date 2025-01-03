import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { log } from "console";
import { AuthDto } from "./dto/auth.dto";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService){}

    @Post('signup')
    signup(@Body() dto: AuthDto){
        console.log({dto,});
        
        return this.authService.signup(dto)
    }

    @Post('login')
    login(@Body() dto: AuthDto){
        return this.authService.login(dto)
    }
    
}