import bcrypt from "bcrypt";

export default class Password {
  static saltRounds: number = 10;

  static validate(enteredPassword: string, storedPassword: string): boolean {
    return bcrypt.compareSync(enteredPassword, storedPassword);
  }

  static hash(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }
}
