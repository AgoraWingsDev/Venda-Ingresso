import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model";

export class UserService {
  async findById(token: string) {
    const payload = jwt.verify(token, "12345") as {
      id: number;
      email: string;
    };
    return UserModel.findById(payload.id);
  }

  async findByEmail(email: string) {
    return UserModel.findByEmail(email);
  }
}
