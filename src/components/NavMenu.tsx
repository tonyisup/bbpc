'use client'

import { FC, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { Auth } from "@/components/Auth";
import { HiX } from "react-icons/hi";
import Link from "next/link";

const NavMenu: FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  function handleClick() {
    setShowMenu(!showMenu);
  }
  return (
    <div className="flex flex-between gap-8 text-red-500 mr-4">
      <div className="sm:hidden">
        <HiMenu className="transition hover:text-red-400 cursor-pointer" onClick={handleClick} />
      </div>
      {showMenu && <div className="flex flex-col fixed p-4 justify-center items-center right-0 gap-4 sm:hidden bg-black">
        <HiX className="transition hover:text-red-400 cursor-pointer" onClick={handleClick} />
        <Link className="transition hover:text-red-400" href="/">Home</Link>
        <Link className="transition hover:text-red-400" href="/history">History</Link>
        <Link className="transition hover:text-red-400" href="/points">Points</Link>
        <Link className="transition hover:text-red-400" href="/game">Game</Link>
        <Auth />
      </div>}
      <div className="gap-4 hidden sm:flex">
        <Link className="transition hover:text-red-400" href="/">Home</Link>
        <Link className="transition hover:text-red-400" href="/history">History</Link>
        <Link className="transition hover:text-red-400" href="/points">Points</Link>
        <Link className="transition hover:text-red-400" href="/game">Game</Link>
        <Auth />
      </div>
    </div>
  );
}

export default NavMenu;