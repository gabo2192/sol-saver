import { Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import path from "path";

/**
 * Helper functions.
 */

function createKeypairFromFile(path: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(path, "utf-8")))
  );
}

export const programKeypair = createKeypairFromFile(
  path.resolve(__dirname, "./program-authority.json")
);
//2FVYTaYzmMm6Cnf8Zrj51BjTtApxDhCVU5G6dLgonX3v 10SOL
export const userKeypair1 = createKeypairFromFile(
  path.resolve(__dirname, "./user1.json")
);
//5x2Ccnmbvm7VszRkVqxDPCTZR5RXh8yPErGVzs4DkEcA 7 SOL
export const userKeypair2 = createKeypairFromFile(
  path.resolve(__dirname, "./user2.json")
);
//7cyqfutmqzqjgihTfQUZqSGgkPF3oRjnhofRVS1AoUTK 16 SOL
export const userKeypair3 = createKeypairFromFile(
  path.resolve(__dirname, "./user3.json")
);
export const vaultKeypair = createKeypairFromFile(
  path.resolve(__dirname, "./vault.json")
);
