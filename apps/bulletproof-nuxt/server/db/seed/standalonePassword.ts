import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";

const hash = new Hash(new Scrypt({}));

export function hashStandalonePassword(password: string): Promise<string> {
  return hash.make(password);
}
