import { IGatewaySessionManager } from './gateway.session';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { jwtConstants, Services } from 'src/utils/constants';
import { Message, User } from 'src/utils/typeorm';
import { JwtService } from '@nestjs/jwt';
import { getRepository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://front-react-359f97dc238f.herokuapp.com',
      'https://front-react-359f97dc238f.herokuapp.com/',
      'https://blind-talk-a887ce0cffca.herokuapp.com/',
      'https://blind-talk-a887ce0cffca.herokuapp.com',
      'https://chat-nextjs-a5df84e059d6.herokuapp.com/',
      'https://chat-nextjs-a5df84e059d6.herokuapp.com',
      'https://nextjs-chat-app-vxuo.vercel.app',
      'https://nextjs-chat-app-vxuo.vercel.app/',
    ],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  private logger = new Logger(MessagingGateway.name);
  private users: Record<string, Socket> = {};
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySessionManager,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log('New Incoming Connection');
    const token = (socket.handshake.auth as any)?.token?.split(' ')[1];

    if (!token) {
      this.logger.error('Authorization token missing.');
      console.log('Authorization token missing.');

      socket.disconnect(true); // Disconnect the socket if no token is present
      return;
    }

    try {
      const decoded: any = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      // Validate the user from the decoded token
      const user = await getRepository(User).findOne(decoded.sub);
      if (!user) {
        this.logger.error('User not found.');
        socket.disconnect(true); // Disconnect if user is not found
        return;
      }

      // Store the socket with the user ID
      this.users[user.id] = socket;

      socket.user = user; // Attach the user to the socket object
      this.logger.log('User authenticated successfully');

      // Proceed with the rest of the connection logic
      socket.emit('connected', { status: 'good' });
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);
      socket.disconnect(true); // Disconnect if token verification fails
    }

    /*  socket.on('callUser', (data) => {
      this.server
        .to(data.userToCall)
        .emit('hey', { signal: data.signalData, from: data.from });
    });
    socket.on('acceptCall', (data) => {
      this.server.to(data.to).emit('callAccepted', data.signal);
    }); */
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('handleDisconnect');
    console.log(`${socket.user} disconnected.`);
    socket.disconnect(true);
    delete this.users[socket.id];
  }

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: Message) {
    console.log('Inside message.create');
    console.log(payload);

    const {
      author,
      conversation: { creator, recipient },
    } = payload;
    console.log('this.users', this.users);

    const authorSocket = this.users[author.id];
    const recipientSocket =
      author.id === creator.id
        ? this.users[recipient.id]
        : this.users[creator.id];

    if (authorSocket) {
      console.log('Emitting message to author socket', author.id);
      authorSocket.emit('onMessage', payload);
    } else {
      console.log('No socket for author', author.id);
    }

    if (recipientSocket) {
      console.log('Emitting message to recipient socket', recipient.id);
      recipientSocket.emit('onMessage', payload);
    } else {
      console.log('No socket for recipient', recipient.id);
    }
    /* 
    recipientSocket && recipientSocket.emit
      ? recipientSocket.emit('onMessage', payload)
      : console.log('no socket with emit for recipient');
    authorSocket && authorSocket.emit
      ? authorSocket.emit('onMessage', payload)
      : console.log('no socket with emit for authorSocket'); */

    /*     console.log('Inside message.create');
    console.log(payload);
    this.server.emit('onMessage', payload);
    return { payload, text: 'done' }; */
  }
}
