import Link from "next/link";
import { SITE_CONFIG, NAV_LINKS } from "@/constants";
import { Plane, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-dark text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
                                <Plane className="h-5 w-5 transform -rotate-45" />
                            </div>
                            <span className="text-xl font-black tracking-tighter">
                                HORIZON
                                <span className="block text-xs font-bold text-secondary tracking-widest leading-none">
                                    LOGISTICS
                                </span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Leading the way in Horizon Logistics and supply chain excellence.
                            Delivering your dreams across every continent with speed, security,
                            and precision.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
                            <Twitter className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
                            <Linkedin className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
                            <Instagram className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 border-l-4 border-secondary pl-3">Quick Links</h3>
                        <ul className="space-y-4">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white text-sm transition-colors block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 border-l-4 border-secondary pl-3">Our Services</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="/services" className="hover:text-white transition-colors block">Air Freight Services</Link></li>
                            <li><Link href="/services" className="hover:text-white transition-colors block">Road Transport</Link></li>
                            <li><Link href="/services" className="hover:text-white transition-colors block">Ocean Shipping</Link></li>
                            <li><Link href="/services" className="hover:text-white transition-colors block">Warehouse Solutions</Link></li>
                            <li><Link href="/services" className="hover:text-white transition-colors block">Supply Chain Management</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 border-l-4 border-secondary pl-3">Contact Us</h3>
                        <ul className="space-y-6">
                            {/* <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-secondary shrink-0" />
                                <span className="text-gray-400 text-sm">{SITE_CONFIG.address}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-secondary shrink-0" />
                                <span className="text-gray-400 text-sm">{SITE_CONFIG.phone}</span>
                            </li> */}
                            {/* <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-secondary shrink-0" />
                                <span className="text-gray-400 text-sm">{SITE_CONFIG.email}</span>
                            </li> */}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
                    <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
