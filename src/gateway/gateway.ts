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
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { Message } from 'src/utils/typeorm';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://front-react-359f97dc238f.herokuapp.com',
      'https://front-react-359f97dc238f.herokuapp.com/',
    ],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessions: IGatewaySessionManager,
  ) {}
  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log('New Incoming Connection');
    console.log(socket.user, socket.id);
    /* this.sessions.setUserSocket(socket.user.id, socket);
    console.log('this.sessions:', this.sessions); */

    socket.emit('connected', { status: 'good' });
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: Message) {
    /*  console.log('Inside message.create');
    console.log(payload);

    const {
      author,
      conversation: { creator, recipient },
    } = payload;
    const authorSocket = this.sessions.getUserSocket(author.id);
    console.log('authorSocket', authorSocket);
    console.log('authorSocket.emit', authorSocket?.emit);

    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);
    console.log('recipientSocket', recipientSocket);
    console.log('recipientSocket.emit', recipientSocket?.emit);

    recipientSocket && recipientSocket.emit
      ? recipientSocket.emit('onMessage', payload)
      : console.log('no socket with emit for recipient');
    authorSocket && authorSocket.emit
      ? authorSocket.emit('onMessage', payload)
      : console.log('no socket with emit for authorSocket'); */

    console.log('Inside message.create');
    console.log(payload);
    this.server.emit('onMessage', payload);
    return { payload, text: 'done' };
  }
}
