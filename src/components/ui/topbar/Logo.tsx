import logoSrc from '@logos/logo-white.png';
import React from 'react'
import Link from "next/link";

function Logo() {
  return (
    <Link href="/">
        <img src='logos/logo-white.png' alt="Logo" />
    </Link>
  )
}

export default Logo