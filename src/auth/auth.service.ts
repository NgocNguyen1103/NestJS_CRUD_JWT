import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { AuthDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { IsEmail } from "class-validator";
import { ConfigService } from "@nestjs/config";
import { use } from "passport";

@Injectable({})
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private jwt: JwtService,
        private config: ConfigService) {}

    async login(dto: AuthDto){
        /*
            find the user email
            if doew not exist -> exeption

            comparing password
            if incorrect -> exeption
        
        */

        const user = await this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user){
            throw new ForbiddenException(
                "User does not exist"
            )
        }

        const check_password = await argon.verify(
            user.hash,
            dto.password,
        )
        if(!check_password){
            throw new ForbiddenException(
                "Incorrect password"
            )
        }
        delete user.hash
        return this.generate_token(user.id, user.email)

        
    }
    async signup(dto: AuthDto){
        const hash = await argon.hash(dto.password);
        /* return a promise string, await to make sure that the password will be hash before creating user \
            if there is no await, the below funbc will be error, because type of hash will be a promise<string>*/

        try{
            const user = await this.prismaService.user.create({
                data:{
                    email: dto.email,
                    hash,
                },
                // select:{
                //     email: true,
                //     createAt: true,
                //     updateAt: true
                // } /select the fields to be returned
            });
            
            return user;
        }
        catch (error){ //handle exeption, avid return 500 error
            if (error instanceof PrismaClientKnownRequestError){ // Error of prisma principle
                throw new ForbiddenException("duplicated email") //nestJS exeption
            }
            else
                throw error
        }
        
        
    }

    async generate_token(userId: number,email: string) {
        const payload = {
            sub: userId,
            email: email
        }
        console.log('Payload before signing:', payload); 
        const token = await this.jwt.signAsync(payload, { expiresIn: '5m', secret: this.config.get('JWT_SECRET') })

        return {"access_token": token,}

        
    }
}