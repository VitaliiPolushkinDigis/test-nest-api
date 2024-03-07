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
      'https://blind-talk-a887ce0cffca.herokuapp.com/',
      'https://blind-talk-a887ce0cffca.herokuapp.com',
      'https://chat-nextjs-a5df84e059d6.herokuapp.com/',
      'https://chat-nextjs-a5df84e059d6.herokuapp.com',
    ],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION)
    private readonly sessions: IGatewaySessionManager,
  ) {}

  @WebSocketServer()
  server: Server;

  private users = {};

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log('New Incoming Connection');
    console.log(socket.user, socket.id);
    this.sessions.setUserSocket(socket.user.id, socket);
    console.log('this.sessions:', this.sessions);

    socket.emit('connected', { status: 'good' });

    //new code for webRTC
    if (!this.users[socket.id]) {
      this.users[socket.id] = socket.id;
    }

    socket.emit('yourID', socket.id);
    this.server.sockets.emit('allUsers', this.users);

    socket.on('disconnect', () => {
      delete this.users[socket.id];
    });

    socket.on('callUser', (data) => {
      this.server
        .to(data.userToCall)
        .emit('hey', { signal: data.signalData, from: data.from });
    });

    socket.on('acceptCall', (data) => {
      this.server.to(data.to).emit('callAccepted', data.signal);
    });

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
    this.sessions.removeUserSocket(socket.user.id);

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
    const authorSocket = this.sessions.getUserSocket(author.id);

    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);

    console.log('<---------SESSIONS', this.sessions.getSockets());

    if (authorSocket) {
      authorSocket.emit('onMessage', payload);
    } else {
      console.log('no socket with emit for authorSocket');
    }

    if (recipientSocket) {
      recipientSocket.emit('onMessage', payload);
    } else {
      console.log('no socket with emit for recipient');
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
