import express, { type Request, type Response, type NextFunction } from 'express';
import bodyParser from 'body-parser';
import type RoomSocketManager from './socket/roomSocketManager.ts';

export default class AppServer {
  public readonly app: express.Application;

  constructor(private readonly socketManager: RoomSocketManager) {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  private configureRoutes() {
    this.app.get('/api/rooms/:pin', (req: Request<{ pin: string }>, res: Response) => {
      const room = this.socketManager.getRoom(req.params.pin);
      if (!room) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }

      res.status(200).json({
        roomstate: room.roomstate,
        players: room.players.map((player) => ({
          id: player.playerId,
          nickname: player.nickname,
        })),
        gameState: room.gameState.visibleState(),
        gameType: room.gameType,
      });
    });

    this.app.get('/api/test', (_req: Request, res: Response) => {
      res.status(200).json({ message: 'Test successful' });
    });

    this.app.get('/test', (_req: Request, res: Response) => {
      res.status(200).json({ message: 'Test (short url) successful' });
    });
  }
}
