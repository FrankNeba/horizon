import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/constants";

export default function ContactPage() {
    return (
        <div className="flex flex-col">
            <section className="bg-gray-50 py-24 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-sm font-black text-secondary uppercase tracking-[0.4em] mb-4">Contact Us</h1>
                    <h2 className="text-5xl font-black text-dark tracking-tighter">GET IN TOUCH WITH US</h2>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Contact Details */}
                        <div className="space-y-12">
                            <div>
                                {/* <h3 className="text-xl font-black text-dark mb-8 border-l-4 border-secondary pl-4">Our Offices</h3> */}
                                <div className="space-y-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-primary/10 p-3 rounded-lg"><Mail className="text-primary h-6 w-6" /></div>
                                        <div>
                                            <p className="font-bold text-dark">Email Us</p>
                                            <a href={`mailto:${SITE_CONFIG.email}`} className="text-gray-500 text-sm hover:text-secondary transition-colors">{SITE_CONFIG.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-secondary/10 p-3 rounded-lg"><Phone className="text-secondary h-6 w-6" /></div>
                                        <div>
                                            <p className="font-bold text-dark">Call Support</p>
                                            <a href={`tel:${SITE_CONFIG.phone}`} className="text-gray-500 text-sm hover:text-secondary transition-colors">{SITE_CONFIG.phone}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark p-8 rounded-3xl text-white">
                                <h4 className="font-black text-lg mb-4 flex items-center">
                                    <Clock className="mr-2 text-secondary" /> WORK HOURS
                                </h4>
                                <div className="space-y-2 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                    <div className="flex justify-between"><span>Mon - Fri:</span><span>08:00 - 18:00</span></div>
                                    <div className="flex justify-between"><span>Saturday:</span><span>09:00 - 15:00</span></div>
                                    <div className="flex justify-between text-secondary"><span>Sunday:</span><span>Closed</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2 bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">
                            <h3 className="text-2xl font-black text-dark mb-8 tracking-tighter">SEND US A MESSAGE</h3>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Your Name</label>
                                    <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Email Address</label>
                                    <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Subject</label>
                                    <input className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Message</label>
                                    <textarea rows={5} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                    <Button variant="secondary" className="w-full md:w-auto px-12 group">
                                        SEND MESSAGE <Send className="ml-2 h-4 w-4 transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-[400px] w-full bg-gray-200">
                {/* Could use the Map component here set to London headquarters */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold italic bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-0.1276,51.5072,12/1200x400?access_token=none')] bg-cover bg-center">
                    Map of Headquarters (London, UK)
                </div>
            </section>
        </div>
    );
}
