"use client";
import { useUserContext } from "@context/user";
import { useLogin } from "@hooks/useLogin";
import { Button } from "@ui/components/ui/button";
import axios from "axios";

interface Props {
  tokenMint: string;
}

export default function AirdropContainer({ tokenMint }: Props) {
  const { user } = useUserContext();
  const { handleSignIn } = useLogin();
  const handleAirdrop = async () => {
    if (!user) return;
    try {
      await axios.post<string>("/api/airdrop", {
        mint: tokenMint,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h3 className="text-xl font-medium text-center mt-10">
        You can also request an airdrop here!
      </h3>{" "}
      {!user ? (
        <Button onClick={handleSignIn}>Login</Button>
      ) : (
        <p className="mt-8 text-center">
          <Button onClick={handleAirdrop} size="lg">
            Claim Airdrop
          </Button>
        </p>
      )}
    </>
  );
}
