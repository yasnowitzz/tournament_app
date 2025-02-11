import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

interface ClientSubscription {
  client: WebSocket;
  userId: number;
}

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server!: Server;

  private clientSubscriptions: ClientSubscription[] = [];

  handleConnection(client: WebSocket) {
    console.log('Client connected');
  }

  handleDisconnect(client: WebSocket) {
    this.clientSubscriptions = this.clientSubscriptions.filter(c => c.client !== client);
    console.log('Client disconnected');
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() data: { userId: number }, @ConnectedSocket() client: WebSocket) {
    this.clientSubscriptions.push({ client, userId: data.userId });
  }

  sendNotification(notification: { userId: number; message: string }) {
    this.clientSubscriptions.forEach(subscription => {
      if (subscription.userId === notification.userId) {
        subscription.client.send(JSON.stringify(notification));
      }
    });
  }
}