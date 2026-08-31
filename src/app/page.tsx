"use client";

import { Button } from "@/components/ui/Button";
import { useShipmentStore } from "@/stores/useShipmentStore";
import { SERVICES, FAQS, TESTIMONIALS, SITE_CONFIG } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Truck, Ship, Train, Search, ArrowRight, ShieldCheck,
  Globe2, Award, ChevronDown, Quote, Star, MapPin, Mail, Phone
} from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TestimonialCarousel } from "@/components/features/TestimonialCarousel";
import { FAQSection } from "@/components/features/FAQSection";

export default function Home() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();
  const { setShipments } = useShipmentStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/shipments");
        const data = await res.json();
        if (Array.isArray(data)) {
          setShipments(data);
        }
      } catch (error) {
        console.error("Failed to prefetch products:", error);
      }
    };

    fetchProducts();
  }, [setShipments]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track?id=${trackingId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] h-[85vh] md:h-[800px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 to-dark/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-110 animate-slow-zoom"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070')" }}
        />

        <div className="container mx-auto px-4 relative z-20 mt-12 md:mt-0">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-secondary text-white text-[10px] font-black tracking-[0.4em] uppercase mb-4 md:mb-8 rounded"
            >
              Excellence in Motion
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-none"
            >
              REVOLUTIONIZING <br />
              <span className="text-secondary">HORIZON</span> LOGISTICS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-gray-200 mb-8 md:mb-12 max-w-2xl leading-relaxed"
            >
              We don't just move cargo; we manage complex supply chains, connecting businesses across
              continents with unmatched precision, speed, and real-time transparency.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 mb-4"
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full px-12 py-8 text-lg rounded-2xl group">
                  GET A QUOTE
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 text-lg">
                  OUR SERVICES
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent z-20" />
      </section>

      {/* Tracking Tool Section */}
      <section className="relative z-30 -mt-10 md:-mt-24 container mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden flex flex-col md:flex-row border border-gray-100"
        >
          <div className="bg-primary p-12 md:w-2/5 flex flex-col justify-center items-center text-white text-center">
            <div className="bg-white/20 p-4 rounded-2xl mb-6">
              <Search className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">LIVE TRACKING</h2>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Global Consignment Portal</p>
          </div>
          <div className="p-12 md:w-3/5 flex flex-col justify-center bg-gray-50/50">
            <form onSubmit={handleTrack} className="w-full space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. AB123456CD)"
                  className="w-full px-8 py-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-secondary transition-all outline-none font-bold tracking-widest text-lg group-hover:border-gray-200"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </div>
              <Button type="submit" variant="success" className="w-full py-5 rounded-2xl text-lg font-black tracking-widest uppercase shadow-xl shadow-success/20">
                TRACK SHIPMENT NOW
              </Button>
            </form>
            <p className="mt-6 text-center text-xs text-gray-400 font-black uppercase tracking-[0.2em]">
              Real-time monitoring active for all air, sea and land cargo.
            </p>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <Globe2 className="absolute -right-20 -bottom-20 h-96 w-96 text-primary/5" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2070"
                alt="Logistic Hub"
                className="w-full h-[400px] object-cover rounded-[40px] shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-10 -right-10 bg-dark p-12 rounded-[32px] text-white shadow-2xl hidden md:block z-20">
                <p className="text-secondary font-black text-6xl mb-2 tracking-tighter">25+</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 leading-relaxed">
                  Years of Global <br /> Logistics Mastery
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-[0.4em] mb-4 underline underline-offset-8">Discover Us</h3>
                <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tighter leading-none mb-6">
                  BEYOND TRADITIONAL <br /> TRANSPORTATION
                </h2>
                <p className="text-gray-500 leading-relaxed text-lg font-medium">
                  Horizon Logistics is more than a carrier. We are a strategic partner
                  that empowers global trade by delivering innovative, data-driven supply chain
                  solutions that are as reliable as they are efficient.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-success/10 p-4 rounded-xl"><ShieldCheck className="h-6 w-6 text-success" /></div>
                  <div>
                    <h4 className="font-black text-dark uppercase tracking-tight">Secured Assets</h4>
                    <p className="text-sm text-gray-500">Premium insurance coverage for all cargo types.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-4 rounded-xl"><Award className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="font-black text-dark uppercase tracking-tight">Certified Excellence</h4>
                    <p className="text-sm text-gray-500">Industry-leading safety and timing protocols.</p>
                  </div>
                </div>
              </div>

              <Link href="/about">
                <Button variant="ghost" className="p-0 text-primary font-black tracking-widest text-xs hover:bg-transparent hover:translate-x-2 transition-all">
                  LEARN MORE ABOUT OUR MISSION <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-secondary uppercase tracking-[0.4em] mb-4">Core Logistics</h2>
            <h3 className="text-4xl md:text-6xl font-black text-dark tracking-tighter uppercase mb-6">Our Capabilities</h3>
            <div className="w-24 h-2 bg-secondary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {SERVICES.map((s, i) => (
              <Link href="/services" key={s.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-12 rounded-[32px] shadow-sm hover:shadow-2xl transition-all group border border-gray-100 hover:-translate-y-4 h-full cursor-pointer"
                >
                  <div className="bg-dark p-6 rounded-2xl group-hover:bg-secondary transition-colors mb-10 w-fit">
                    {i === 0 && <Plane className="h-10 w-10 text-white" />}
                    {i === 1 && <Truck className="h-10 w-10 text-white" />}
                    {i === 2 && <Ship className="h-10 w-10 text-white" />}
                    {i === 3 && <Train className="h-10 w-10 text-white" />}
                  </div>
                  <h4 className="text-2xl font-black text-dark mb-6 tracking-tighter uppercase">{s.title}</h4>
                  <p className="text-gray-400 font-medium leading-relaxed mb-10">
                    {s.description}
                  </p>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <span className="text-xs font-black text-gray-300 tracking-widest uppercase">Global Delivery</span>
                    <ArrowRight className="h-5 w-5 text-secondary scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-dark py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-5xl md:text-7xl font-black text-secondary mb-4 tracking-tighter">150+</p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Countries Served</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black text-secondary mb-4 tracking-tighter">1.2M</p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Packages Moved</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black text-secondary mb-4 tracking-tighter">99%</p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Success Rate</p>
            </div>
            <div>
              <p className="text-5xl md:text-7xl font-black text-secondary mb-4 tracking-tighter">24/7</p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Proactive Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-secondary uppercase tracking-[0.4em] mb-4">Corporate Reviews</h2>
            <h3 className="text-4xl md:text-6xl font-black text-dark tracking-tighter uppercase">VOICES OF TRUST</h3>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-sm font-black text-secondary uppercase tracking-[0.4em] mb-4">Expert Help</h2>
              <h3 className="text-4xl md:text-6xl font-black text-dark tracking-tighter uppercase mb-10 leading-none">
                FREQUENTLY <br /> ASKED QUESTIONS
              </h3>
              <p className="text-gray-400 text-lg font-medium leading-relaxed mb-12">
                Can't find the answer you're looking for? Reach out to our specialized
                logistics consultants for a personalized solution to your business needs.
              </p>
              <Link href="/contact">
                <Button variant="secondary" className="px-10 py-6 text-sm font-black tracking-widest uppercase rounded-2xl">
                  VISIT HELP CENTER
                </Button>
              </Link>
            </div>
            <FAQSection />
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590496793907-35071d46747d?q=80&w=2070')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl bg-white rounded-[40px] p-12 md:p-20 shadow-2xl flex flex-col lg:flex-row gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl md:text-5xl font-black text-dark tracking-tighter leading-tight uppercase">
                READY TO MOVE <br /> YOUR CARGO?
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-6 group">
                  <div className="bg-primary p-4 rounded-2xl text-white group-hover:bg-secondary transition-colors"><Mail /></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Support</p>
                    <p className="text-lg font-black text-dark tracking-tighter">{SITE_CONFIG.email}</p>
                  </div>
                </div>
                {/* <div className="flex items-center space-x-6 group">
                  <div className="bg-primary p-4 rounded-2xl text-white group-hover:bg-secondary transition-colors"><Phone /></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Direct Line</p>
                    <p className="text-lg font-black text-dark tracking-tighter">{SITE_CONFIG.phone}</p>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="w-full lg:w-[400px]">
              <form className="space-y-4">
                <input placeholder="Full Name" className="w-full px-8 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary font-bold transition-all" />
                <input placeholder="Phone / Email" className="w-full px-8 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary font-bold transition-all" />
                <textarea placeholder="Tell us about your cargo" rows={4} className="w-full px-8 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary font-bold transition-all" />
                <Button variant="secondary" className="w-full py-5 rounded-2xl font-black tracking-widest uppercase text-sm shadow-xl shadow-secondary/20">
                  REQUEST CALLBACK
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LogisticsCompany",
            "name": SITE_CONFIG.name,
            "url": "https://horizonlogistics.com",
            "logo": "https://horizonlogistics.com/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": SITE_CONFIG.phone,
              "contactType": "customer service"
            }
          })
        }}
      />
    </div>
  );
}
