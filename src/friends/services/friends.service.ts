import { Services } from 'src/utils/constants';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Friendship } from '../../utils/typeorm';
import { CreateFriendDto } from '../dtos/create-friend.dto';
import { UpdateFriendDto } from '../dtos/update-friend.dto';
import { FriendshipStatus } from '../../utils/typeorm/entities/Friendship';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  async sendRequest(requesterId: number, createFriendDto: CreateFriendDto) {
    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });
    const addressee = await this.userRepository.findOne({
      where: { id: createFriendDto.addresseeId },
    });

    if (!addressee) {
      throw new NotFoundException('User not found');
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          requester: { id: requesterId },
          addressee: { id: createFriendDto.addresseeId },
        },
        {
          requester: { id: createFriendDto.addresseeId },
          addressee: { id: requesterId },
        },
      ],
    });

    if (existingFriendship) {
      throw new BadRequestException('Friendship already exists');
    }

    const friendship = this.friendshipRepository.create({
      requester,
      addressee,
      status: FriendshipStatus.PENDING,
    });

    return this.friendshipRepository.save(friendship);
  }

  async getFriendRequests(userId: number) {
    return this.friendshipRepository.find({
      where: [{ addressee: { id: userId }, status: FriendshipStatus.PENDING }],
    });
  }

  async respondToRequest(
    userId: number,
    friendshipId: number,
    status: FriendshipStatus,
  ) {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId, addressee: { id: userId } },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    friendship.status = status;
    return this.friendshipRepository.save(friendship);
  }

  async getFriends(userId: number) {
    const friendships = await this.friendshipRepository.find({
      where: [
        { requester: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { addressee: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
    });

    return friendships.map((friendship) =>
      friendship.requester.id === userId
        ? friendship.addressee
        : friendship.requester,
    );
  }

  async removeFriend(userId: number, friendshipId: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { id: friendshipId, requester: { id: userId } },
        { id: friendshipId, addressee: { id: userId } },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    return this.friendshipRepository.remove(friendship);
  }
}
