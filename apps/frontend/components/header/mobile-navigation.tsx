import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
interface Props {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  navigation: { name: string; href: string }[];
  handleSignIn: () => void;
}

export default function MobileNavigation({
  mobileMenuOpen,
  setMobileMenuOpen,
  navigation,
  handleSignIn,
}: Props) {
  const { data: session } = useSession();
  return (
    <Dialog
      as="div"
      className={clsx("lg:hidden")}
      open={mobileMenuOpen}
      onClose={setMobileMenuOpen}
    >
      <div className="fixed inset-0 z-10" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-primary/10">
        <div className="flex items-center justify-between">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <Image
              className="h-8 w-auto"
              src="/logo.png"
              alt="sol-saver"
              width={400}
              height={400}
            />
          </a>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-900"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="py-6">
              {!session && (
                <button
                  onClick={handleSignIn}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-gray-900"
                >
                  Log in
                </button>
              )}
              {session?.user && (
                <>
                  {session.user.image && (
                    <span
                      style={{
                        backgroundImage: `url('${session.user.image}')`,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
