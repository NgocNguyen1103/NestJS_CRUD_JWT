import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { log } from "console";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(config: ConfigService, private prisma: PrismaService){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
        })
    }

    async validate(payload:{
        sub: number,
        email: string
        }) {
        // use sub(id) from the payload to return the usre infor
        const user = await this.prisma.user.findFirst(
            {
                where: {
                    id: payload.sub
                }
            }
        )
        delete user.hash
        return user
    }
}