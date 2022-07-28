import * as bcrypt from 'bcrypt';
import UserDto from "../user/user.dto";
import User from "../user/user.entity";
import {IDataInToken} from "../interfaces/dataInToken.inteface";
import UserWithThatEmailExistException from "../exceptions/UserWithThatEmailExistException";
import WrongCredationalsException from "../exceptions/WrongCredationalsException.exception";
import TokenService from "../token/token-service";
import { getRepository } from "typeorm";

class AuthService {

  constructor(){}
  
  private userRepository = getRepository(User);
  private tokenService = new TokenService();

  public async register(userData: UserDto) {
    const user = await this.userRepository.findOne({email: userData.email})

    if (user) {
      throw new UserWithThatEmailExistException(userData.email)
    }

    const hashedPassword = await bcrypt.hash(userData.password, 7);

    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    newUser.password = undefined;

    const tokens = this.tokenService.generateTokens({id: newUser.id, email: newUser.email });
    await this.tokenService.saveToken(newUser.id, tokens.refreshToken);

    return { ...tokens, user: newUser};
  }

  public async login(userData: UserDto) {
    const user = await this.userRepository.findOne({
      email: userData.email,
    });
    
    if (user) {
      const doesPasswordMatching = await bcrypt.compare(userData.password, user.password)

      if (doesPasswordMatching) {
        user.password = undefined;

        const tokens = this.tokenService.generateTokens({id: user.id, email: user.email });

        await this.tokenService.saveToken(user.id, tokens.refreshToken);
        return {...tokens, user: userData}
      }
      throw new WrongCredationalsException();
    }
    throw new WrongCredationalsException();
  }

  public async logout (refreshToken: string) {
    const token = await this.tokenService.removeToken(refreshToken);
    return token;
  }

  public async refresh (refreshToken: string) {
    if(!refreshToken) {
      throw new WrongCredationalsException();
    }

    const userData = this.tokenService.validateRefreshToken(refreshToken) as IDataInToken;
    const tokenFromDB = this.tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw new WrongCredationalsException();
    }

    const user = await this.userRepository.findOne({id: userData.id});
    const tokens = await this.tokenService.generateTokens({...user});

    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return {...tokens, user}
  }
}

export default AuthService;