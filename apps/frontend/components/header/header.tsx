import { Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAppContext } from "../../context/app";
import { useLogin } from "../../hooks/useLogin";
import MobileNavigation from "./mobile-navigation";
import ProfileDropdown from "./profile-dropdown";

const navigation = [
  { name: "Stake", href: "/" },
  { name: "Prizes", href: "/prizes" },
  // { name: "Marketplace", href: "#" },
  { name: "Company", href: "/company" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { handleSignIn } = useLogin();
  const { isDarkMode, setIsDarkMode } = useAppContext();
  return (
    <header className="bg-background">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-12">
          <div className="flex flex-row items-center gap-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Sol Saver</span>
              <Image
                className="h-8 w-auto"
                src="/logo.png"
                alt="sol-saver"
                width={400}
                height={400}
              />
            </Link>
            <Link href="/">
              <h1 className="font-bold uppercase text-foreground">Sol Saver</h1>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="ml-auto mr-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md py-2.5 text-primary"
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            <span className="sr-only">Toggle dark mode</span>
            {isDarkMode ? (
              <SunIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md py-2.5 text-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex">
          {!session && (
            <button
              onClick={handleSignIn}
              className="text-sm font-semibold leading-6 text-foreground"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </button>
          )}
          {session && <ProfileDropdown />}
        </div>
      </nav>
      <MobileNavigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigation={navigation}
        handleSignIn={handleSignIn}
      />
    </header>
  );
}
