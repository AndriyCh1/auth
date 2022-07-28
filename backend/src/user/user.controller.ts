import Controller from "../interfaces/controller.interface";
import {NextFunction, Request, Response, Router} from "express";
import UserService from "./user.service";
import authMiddleware from "../middlewares/auth.middleware";

class UserController implements Controller {
    public path = '/user';
    public router = Router();
    private userService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // TODO: fix auth middleware using (problem with custom req)
        // @ts-ignore
        this.router.get(`${this.path}/users`, authMiddleware, this.getAllUsers)
    }

    private getAllUsers = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const users =  await this.userService.getAll();
            return res.send(users);
        } catch (e) {
            next(e)
        }
    }
}

export default UserController;