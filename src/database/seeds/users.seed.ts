import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../users/schemas/user.schema';

// Usuarios iniciales del sistema (mismos que el frontend)
const initialUsers = [
  {
    email: 'admin@espora.com',
    password: 'password',
    name: 'Super Administrador',
    role: 'super_admin',
    permissions: [
      'create_accounts',
      'edit_accounts',
      'delete_accounts',
      'view_all_accounts',
      'manage_users',
      'assign_tasks',
      'view_reports',
      'edit_expediente',
      'edit_checklist',
      'edit_presentacion'
    ],
    avatar: 'https://raw.githubusercontent.com/Esporadix-team/imagenes_logos/main/admin-avatar.png'
  },
  {
    email: 'operador@espora.com',
    password: 'espora2024',
    name: 'Operador EHO',
    role: 'admin',
    permissions: [
      'view_accounts',
      'edit_checklist',
      'view_reports',
      'assign_tasks'
    ],
    avatar: 'https://raw.githubusercontent.com/Esporadix-team/imagenes_logos/main/operator-avatar.png'
  },
  {
    email: 'capturista@espora.com',
    password: 'espora2024',
    name: 'Capturista',
    role: 'user',
    permissions: [
      'view_accounts',
      'edit_checklist'
    ],
    avatar: 'https://raw.githubusercontent.com/Esporadix-team/imagenes_logos/main/user-avatar.png'
  }
];

@Injectable()
export class UsersSeedService implements OnModuleInit {
  private readonly logger = new Logger(UsersSeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    this.logger.log('Verificando usuarios iniciales...');

    for (const userData of initialUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await this.userModel.findOne({ email: userData.email });

        if (!existingUser) {
          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          // Crear el usuario
          const newUser = new this.userModel({
            ...userData,
            password: hashedPassword,
          });

          await newUser.save();
          this.logger.log(`✅ Usuario creado: ${userData.email}`);
        } else {
          this.logger.log(`⏭️  Usuario ya existe: ${userData.email}`);
        }
      } catch (error) {
        this.logger.error(`❌ Error creando usuario ${userData.email}:`, error.message);
      }
    }

    this.logger.log('Verificación de usuarios completada.');
  }
}
