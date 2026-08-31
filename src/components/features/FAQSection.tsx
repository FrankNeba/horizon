"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/constants";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full px-8 py-6 flex items-center justify-between text-left group"
                    >
                        <span className={`text-lg font-black tracking-tight transition-colors ${openIndex === i ? 'text-primary' : 'text-dark group-hover:text-primary'}`}>
                            {faq.question}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {openIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="px-8 pb-6 text-gray-500 leading-relaxed font-medium">
                                    {faq.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
