"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_CONFIG } from "@/constants";
import { Menu, X, Plane } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Hide Navbar on Admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-primary p-2.5 rounded-xl shadow-md flex items-center justify-center text-white">
                                <Plane className="h-6 w-6 transform -rotate-45" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-dark tracking-tighter leading-none">
                                    HORIZON
                                </span>
                                <span className="text-xs sm:text-sm font-extrabold text-secondary tracking-widest leading-tight">
                                    LOGISTICS
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-bold uppercase transition-colors ${pathname === link.href
                                    ? "text-secondary"
                                    : "text-dark hover:text-secondary"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/contact">
                            <Button size="sm" variant="secondary" className="rounded-full">
                                GET STARTED
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-dark p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-4 text-base font-bold uppercase ${pathname === link.href
                                    ? "text-secondary font-black"
                                    : "text-dark"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="px-3 pb-4">
                            <Link href="/contact" onClick={() => setIsOpen(false)}>
                                <Button variant="secondary" className="w-full">
                                    GET STARTED
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
