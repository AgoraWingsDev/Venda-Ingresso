import { Database } from "../database";
import { UserModel } from "../models/user-model";
import { CustomerModel } from "../models/customer-model";

export class CustomerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
  }) {
    const { name, email, password, address, phone } = data;
    console.log("== customers ==", name, email, password, address, phone);

    const connection = await Database.getInstance().getConnection();

    try {
      await connection.beginTransaction();
      const user = await UserModel.create(
        {
          name,
          email,
          password,
        },
        { connection }
      );

      const userId = user.id;

      const customer = await CustomerModel.create(
        {
          user_id: userId,
          address,
          phone,
        },
        { connection }
      );

      await connection.commit();

      return {
        id: customer.id,
        user_id: userId,
        address,
        phone,
        created_at: customer.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<CustomerModel | null> {
    return CustomerModel.findByUserId(userId, { user: true });
  }
}

export class InvalidCredentialsError extends Error {}
