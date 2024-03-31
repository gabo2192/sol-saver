"use client";
import clsx from "clsx";
import Head from "next/head";
import { useEffect } from "react";
import { useAppContext } from "../../context/app";
import { Header } from "../header";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { isDarkMode } = useAppContext();
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  }, [isDarkMode]);
  return (
    <>
      <Head>
        <body
          className={clsx({
            "dark ": isDarkMode,
          })}
        />
      </Head>
      <Header />
      <main className="px-3 max-w-7xl mx-auto">{children}</main>
    </>
  );
}
