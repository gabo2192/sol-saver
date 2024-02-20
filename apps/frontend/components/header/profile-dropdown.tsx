import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { Fragment } from "react";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-200">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          {session?.user?.image && (
            <img
              className="h-12 w-12 rounded-full "
              src={session.user.image}
              alt="profile-pic"
            />
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-white ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={clsx(
                  active ? "bg-gray-600" : "",
                  "block px-4 py-2 text-sm text-white"
                )}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={clsx(
                  active ? "bg-gray-600" : "",
                  "block px-4 py-2 text-sm text-white"
                )}
              >
                Settings
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="/api/auth/signout"
                className={clsx(
                  active ? "bg-gray-600" : "",
                  "block px-4 py-2 text-sm text-white"
                )}
              >
                Sign out
              </a>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
