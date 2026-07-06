import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import AppServer from './app.ts';
import RoomSocketManager from './socket/roomSocketManager.ts';

export default class ServerBootstrap {
  public readonly httpServer: http.Server;
  public readonly io: SocketIOServer;
  public readonly appServer: AppServer;
  public readonly socketManager: RoomSocketManager;

  constructor(port = Number(process.env.PORT || 3001)) {
    this.socketManager = new RoomSocketManager();
    this.appServer = new AppServer(this.socketManager);
    this.httpServer = http.createServer(this.appServer.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://192.168.50.200:5173',
          'http://localhost:80',
          'http://client:80',
          'http://localhost',
          'http://localhost:3000',
        ],
        methods: ['GET', 'POST'],
      },
    });

    this.socketManager.setIo(this.io);
    this.socketManager.attach();

    this.httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on ${port}`);
    });
  }
}
