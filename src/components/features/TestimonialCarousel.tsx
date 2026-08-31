"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/constants";

export function TestimonialCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const next = () => setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    const prev = () => setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

    return (
        <div className="relative max-w-4xl mx-auto py-12">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-12 md:p-16 rounded-[40px] shadow-2xl border border-gray-50 flex flex-col md:flex-row gap-12 items-center text-center md:text-left"
                >
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-secondary/20 rounded-full scale-110 animate-pulse" />
                        <img
                            src={TESTIMONIALS[index].avatar}
                            alt={TESTIMONIALS[index].name}
                            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover object-center relative z-10 border-4 border-white shadow-xl aspect-square"
                        />
                        <Quote className="absolute -top-4 -left-4 h-10 w-10 text-secondary fill-secondary opacity-20 z-20" />
                    </div>

                    <div className="flex-grow">
                        <div className="flex justify-center md:justify-start space-x-1 mb-6">
                            {[...Array(TESTIMONIALS[index].rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                            ))}
                        </div>
                        <p className="text-xl md:text-2xl font-medium text-dark italic leading-relaxed mb-8">
                            "{TESTIMONIALS[index].text}"
                        </p>
                        <div>
                            <h4 className="text-xl font-black text-dark uppercase tracking-tighter">{TESTIMONIALS[index].name}</h4>
                            <p className="text-secondary font-black text-xs tracking-widest uppercase">{TESTIMONIALS[index].company}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-12 space-x-4">
                <button onClick={prev} className="p-4 rounded-full bg-dark text-white hover:bg-secondary transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={next} className="p-4 rounded-full bg-dark text-white hover:bg-secondary transition-colors">
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
