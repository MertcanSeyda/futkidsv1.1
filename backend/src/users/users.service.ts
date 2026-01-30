import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { Academy } from '../academies/schemas/academy.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Academy.name) private academyModel: Model<Academy>,
        private mailService: MailService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            let generatedPassword: string | null = null;
            let passwordToHash = createUserDto.password;

            if (!passwordToHash || passwordToHash.trim() === '') {
                // Auto-generate password: 8 chars random
                generatedPassword = Math.random().toString(36).slice(-8);
                passwordToHash = generatedPassword;
            }

            const hashedPassword = await bcrypt.hash(passwordToHash, 10);

            // Clean up empty strings for ObjectIds to avoid CastError
            const userData: any = { ...createUserDto, password: hashedPassword };

            if (userData.academy === "") {
                delete userData.academy;
            } else if (userData.academy && Types.ObjectId.isValid(userData.academy)) {
                userData.academy = new Types.ObjectId(userData.academy);
            }

            if (userData.playerProfile) {
                if (userData.playerProfile.parent === "") {
                    delete userData.playerProfile.parent;
                }
                // If it's not a player, we might want to remove playerProfile entirely
                if (userData.role !== 'player') {
                    delete userData.playerProfile;
                }
            }

            const user = await this.userModel.create(userData);

            // Update counts in Academy if academy is provided
            if (user.academy) {
                const updateField = user.role === 'player' ? 'playerCount' : user.role === 'coach' ? 'coachCount' : user.role === 'parent' ? 'parentCount' : null;
                if (updateField) {
                    await this.academyModel.findByIdAndUpdate(user.academy, { $inc: { [updateField]: 1 } });
                }
            }

            // Send welcome email if password was generated or even if not (optional, but requested logic implies auto-send)
            // We only send if we have a password to show (generated or provided)
            await this.mailService.sendUserWelcome(user, generatedPassword || createUserDto.password);

            // Don't return password normally, but we return generatedPassword if it exists
            const { password, ...result } = user.toObject();
            return { ...result, generatedPassword };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findAll(role?: string, academy?: string, parent?: string) {
        try {
            const filter: any = {};
            if (role) filter.role = role;

            if (academy && Types.ObjectId.isValid(academy)) {
                filter.academy = new Types.ObjectId(academy);
            }

            if (parent && Types.ObjectId.isValid(parent)) {
                filter['playerProfile.parent'] = new Types.ObjectId(parent);
            }

            const query = this.userModel.find(filter).select('-password');

            // Only populate academy if it exists
            query.populate('academy', 'name');

            // Only attempt to populate parent if it's likely to exist (for players)
            if (role === 'player' || !role) {
                query.populate({
                    path: 'playerProfile.parent',
                    select: 'fullName email',
                    strictPopulate: false
                });
            }

            const results = await query.exec();
            return results;
        } catch (error) {
            console.error('Detailed Error in UsersService.findAll:', error);
            throw error;
        }
    }

    async findOne(id: string) {
        const user = await this.userModel
            .findById(id)
            .select('-password')
            .populate('academy', 'name address')
            .populate({
                path: 'playerProfile.parent',
                select: 'fullName email phone',
                strictPopulate: false
            })
            .exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        try {
            const updateData: any = { ...updateUserDto };

            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            } else {
                delete updateData.password;
            }

            if (updateData.academy === "") delete updateData.academy;

            if (updateData.playerProfile) {
                if (updateData.playerProfile.parent === "") {
                    delete updateData.playerProfile.parent;
                }
            }

            const user = await this.userModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .select('-password')
                .exec();

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async remove(id: string) {
        const user = await this.userModel.findByIdAndDelete(id).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Update counts in Academy if academy was provided
        if (user.academy) {
            const updateField = user.role === 'player' ? 'playerCount' : user.role === 'coach' ? 'coachCount' : user.role === 'parent' ? 'parentCount' : null;
            if (updateField) {
                await this.academyModel.findByIdAndUpdate(user.academy, { $inc: { [updateField]: -1 } });
            }
        }

        return { message: 'User deleted successfully' };
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).select('+password').exec();
    }
}
