import { SITE_CONFIG } from "@/constants";
import { Plane, Award, Shield, Globe, Users, Clock } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Header */}
            <section className="bg-dark py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-sm font-black text-secondary tracking-[0.3em] uppercase mb-4">Who We Are</h1>
                    <h2 className="text-5xl font-black tracking-tighter">ABOUT OUR COMPANY</h2>
                </div>
            </section>

            {/* Hero Content */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/10 rounded-full -z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070"
                                alt="Logistics team"
                                className="rounded-3xl shadow-2xl"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl hidden md:block max-w-xs">
                                <p className="text-primary font-black text-4xl mb-2">25+</p>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Years of Excellence in Logistics</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h3 className="text-3xl font-black text-dark leading-tight tracking-tighter">
                                LEADERS IN <span className="text-secondary">ELITE LOGISTICS</span> SOLUTIONS
                            </h3>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Founded over two decades ago, {SITE_CONFIG.name} has grown from a local courier
                                to a global powerhouse in the logistics sector. We specialize in complex
                                supply chain management across air, land, and sea.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-success/10 p-3 rounded-lg"><Shield className="text-success h-6 w-6" /></div>
                                    <div>
                                        <h4 className="font-bold text-dark mb-1">Secure Shipping</h4>
                                        <p className="text-sm text-gray-500">Industry-leading safety protocols for every parcel.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary/10 p-3 rounded-lg"><Globe className="text-primary h-6 w-6" /></div>
                                    <div>
                                        <h4 className="font-bold text-dark mb-1">Global Network</h4>
                                        <p className="text-sm text-gray-500">Connecting businesses in 150+ countries.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-24">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-4xl font-black text-dark mb-16 tracking-tighter uppercase">Our Core Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-white p-12 rounded-3xl shadow-sm border border-white hover:shadow-xl transition-all">
                            <Clock className="h-12 w-12 text-secondary mx-auto mb-6" />
                            <h4 className="text-xl font-bold mb-4">On-Time Delivery</h4>
                            <p className="text-gray-400 text-sm">We respect your schedule and ensure prompt arrivals every time.</p>
                        </div>
                        <div className="bg-white p-12 rounded-3xl shadow-sm border border-white hover:shadow-xl transition-all">
                            <Award className="h-12 w-12 text-secondary mx-auto mb-6" />
                            <h4 className="text-xl font-bold mb-4">Excellence</h4>
                            <p className="text-gray-400 text-sm">Quality is at the heart of everything we do, from pickup to drop-off.</p>
                        </div>
                        <div className="bg-white p-12 rounded-3xl shadow-sm border border-white hover:shadow-xl transition-all">
                            <Users className="h-12 w-12 text-secondary mx-auto mb-6" />
                            <h4 className="text-xl font-bold mb-4">Customer First</h4>
                            <p className="text-gray-400 text-sm">Your satisfaction is our ultimate goal and driving force.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
