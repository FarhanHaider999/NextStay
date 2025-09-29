import { NAVBAR_HEIGHT } from "@/lib/constants";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full py-3 px-8 bg-zinc-800 text-white">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="cursor-pointer hover:text-gray-900"
            scroll={false}
          >
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-zinc-200  hover:text-gray-600">
                Next
                <span className="text-slate-300 font-light hover:text-gray-400">
                  Stay
                </span>
              </div>
            </div>
          </Link>
        </div>
        {/* desc */}
        <p className="text-gray-300 hidden md:block">
          Discover your perfect rental apartment with our advaced search
        </p>
        {/* Buttons */}
        <div className="flex items-center gap-5">
            {/* SignIn Btn */}
          <Link href="/signin">
            <Button
              variant="outline"
              className="text-white border-white bg-transparent hover:bg-white hover:text-zinc-950 rounded-lg"
            >
              Sign In
            </Button>
          </Link>
            {/* SignUp Btn */}
          <Link href="/signup">
            <Button
              variant="secondary"
              className="bg-red-500 hover:bg-white hover:text-zinc-950 rounded-lg"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
