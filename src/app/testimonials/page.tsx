import { Quote, Star, User } from "lucide-react";

export default function TestimonialsPage() {
    const testimonials = [
        {
            name: "Alexander Reed",
            company: "TechNexus Global",
            text: "Their air freight service is second to none. Reliable tracking and fast delivery have made them our primary logistics partner.",
            rating: 5
        },
        {
            name: "Sarah Jenkins",
            company: "Elite Manufacturing",
            text: "We've been using their road transport for years. The precision and safety they provide for our heavy machinery is incredible.",
            rating: 5
        },
        {
            name: "David Chen",
            company: "Ocean Ventures",
            text: "The most transparent logistics company I've worked with. Their mapping tool reveals exactly where our containers are in real-time.",
            rating: 4
        }
    ];

    return (
        <div className="flex flex-col">
            <section className="bg-secondary py-24 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-sm font-black uppercase tracking-[0.4em] mb-4 text-white/80">Reviews</h1>
                    <h2 className="text-5xl font-black tracking-tighter">WHAT OUR CLIENTS SAY</h2>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-12 rounded-3xl shadow-xl border border-gray-50 relative group">
                            <Quote className="absolute top-8 right-8 h-12 w-12 text-gray-100 group-hover:text-secondary/10 transition-colors" />
                            <div className="flex space-x-1 mb-6">
                                {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
                            </div>
                            <p className="text-gray-500 italic mb-8 relative z-10 font-medium">"{t.text}"</p>
                            <div className="flex items-center space-x-4">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <User className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-black text-dark text-sm uppercase">{t.name}</p>
                                    <p className="text-xs text-secondary font-bold uppercase tracking-widest">{t.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
