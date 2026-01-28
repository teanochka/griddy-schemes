import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <header className="bg-black">
  <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
    <Image src='/logo.png' alt='logo'
    width={100}
    height={100}
    />

    <div className="flex flex-1 items-center justify-end md:justify-between">
      <nav aria-label="Global" className="hidden md:block">
        <ul className="flex items-center gap-6 text-sm">
          <li>
            <a className="text-white transition hover:text-gray-100" href="#"> About </a>
          </li>

          <li>
            <a className="text-white transition hover:text-gray-100/75" href="#"> Careers </a>
          </li>

          <li>
            <a className="text-white transition hover:text-gray-100/75" href="#"> History </a>
          </li>

          <li>
            <a className="text-white transition hover:text-gray-100/75" href="#"> Services </a>
          </li>

          <li>
            <a className="text-white transition hover:text-gray-100/75" href="#"> Projects </a>
          </li>

        
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <div className="sm:flex sm:gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-gray-100">
              Login
            </Button>
          </Link>

          <Link href="/signup">
            <Button variant="outline" className="hidden sm:inline-flex">
              Register
            </Button>
          </Link>
        </div>

        <Button>
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>
    </div>
  </div>
</header>
  )
}

export default Header