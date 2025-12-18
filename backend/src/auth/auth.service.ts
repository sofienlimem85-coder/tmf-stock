import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      if (existing.emailVerified) {
        throw new ConflictException('Email already in use');
      }
      // Si l'email existe mais n'est pas vérifié, on supprime l'ancien compte
      await this.usersService.remove(existing.id);
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10); // Valide 10 minutes

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
      emailVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    // Envoyer l'email de vérification
    try {
      await this.emailService.sendVerificationCode(dto.email, verificationCode);
    } catch (error) {
      // Si l'envoi d'email échoue, supprimer l'utilisateur créé
      await this.usersService.remove(user.id);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return {
      message: 'Verification code sent to your email',
      email: dto.email,
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or code');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      throw new BadRequestException('No verification code found. Please sign up again.');
    }

    if (new Date() > user.verificationCodeExpires) {
      throw new BadRequestException('Verification code expired. Please sign up again.');
    }

    if (user.verificationCode !== dto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Marquer l'email comme vérifié et supprimer le code
    await this.usersService.update(user.id, {
      emailVerified: true,
      verificationCode: undefined,
      verificationCodeExpires: undefined,
    });

    return this.buildToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified. Please verify your email first.');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildToken(user.id, user.email, user.role);
  }

  private async buildToken(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      access_token: accessToken,
    };
  }
}


