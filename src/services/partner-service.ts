import { Database } from "../database";
import { UserModel } from "../models/user-model";
import { PartnerModel } from "../models/partner-model";

export class PartnerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = data;

    const connection = await Database.getInstance().getConnection();

    try {
      await connection.beginTransaction();

      const userModel = await UserModel.create(
        {
          name,
          email,
          password,
        },
        { connection }
      );

      const userId = userModel.id;

      const partner = await PartnerModel.create(
        {
          userId,
          companyName: company_name,
        },
        { connection }
      );

      await connection.commit();
      return {
        id: partner.id,
        name,
        user_id: userId,
        company_name: company_name,
        created_at: partner.created_at,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUserId(userId: number) {
    return PartnerModel.findByUserId(userId);
  }
}
