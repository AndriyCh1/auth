import { IsOptional, IsString } from "class-validator";

class LogInDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  @IsOptional()
  public fullName?: string;
}

export default LogInDto;