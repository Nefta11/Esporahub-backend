import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { Public } from '../middlewares/public.decorator';
import { CurrentUser } from '../middlewares/current-user.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica al usuario y retorna un token JWT válido por 2 horas.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna el token JWT y datos del usuario.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario', description: 'Crea una nueva cuenta de usuario en el sistema.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente. Retorna el token JWT.' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil', description: 'Retorna los datos del perfil del usuario autenticado.' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar token', description: 'Valida si el token JWT es vigente y retorna los datos del usuario.' })
  @ApiResponse({ status: 200, description: 'Token válido.', schema: { example: { valid: true, user: { userId: '...', email: '...' } } } })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  async verifyToken(@CurrentUser() user: any) {
    return { valid: true, user };
  }
}
