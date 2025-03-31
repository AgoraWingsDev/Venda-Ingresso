import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model";

export class AuthService {
  async login(email: string, password: string) {
    console.log("== login ==", email, password);

    const userModel = await UserModel.findByEmail(email);
    if (userModel && bcrypt.compareSync(password, userModel.password)) {
      return jwt.sign({ id: userModel.id, email: userModel.email }, "12345", {
        expiresIn: "1h",
      });
    } else {
      throw new InvalidCredentialsError();
    }
  }
}

export class InvalidCredentialsError extends Error {}
