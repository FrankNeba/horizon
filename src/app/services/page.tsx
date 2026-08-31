import { SERVICES } from "@/constants";
import { Plane, Truck, Ship, Train, Warehouse, Laptop, ShieldCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServicesPage() {
    const iconMap: Record<string, any> = {
        Plane, Truck, Ship, Train
    };

    return (
        <div className="flex flex-col">
            <section className="bg-primary pt-24 pb-48 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-sm font-black uppercase tracking-[0.4em] mb-4 opacity-80 underline underline-offset-8">What We Offer</h1>
                    <h2 className="text-5xl font-black tracking-tighter">HORIZON LOGISTICS SOLUTIONS</h2>
                </div>
            </section>

            <section className="container mx-auto px-4 -mt-32 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {SERVICES.map((s) => {
                        const IconComp = iconMap[s.icon] || Plane;
                        return (
                            <div key={s.title} className="bg-white group p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-gray-50 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                <div className="bg-dark p-6 rounded-2xl group-hover:bg-secondary transition-colors shrink-0">
                                    <IconComp className="h-10 w-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-dark mb-4 tracking-tighter uppercase">{s.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-6">
                                        Our {s.title.toLowerCase()} provides the highest standard of security and speed.
                                        We handle everything from documentation to final delivery with unmatched expertise.
                                    </p>
                                    <Button variant="ghost" className="p-0 font-black tracking-widest text-xs">DISCOVER MORE</Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Value Proposition */}
            <section className="bg-dark py-24 text-white overflow-hidden relative">
                <Globe2 className="absolute -right-20 -bottom-20 h-96 w-96 text-white/5" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h3 className="text-4xl font-black mb-16 tracking-tighter uppercase">Why Choose {process.env.NEXT_PUBLIC_SITE_NAME || 'Horizon Logistics'}?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="space-y-4">
                            <Warehouse className="h-10 w-10 text-secondary mx-auto" />
                            <h4 className="font-bold">Warehousing</h4>
                            <p className="text-sm text-gray-400">Secure storage solutions in 100+ strategic locations.</p>
                        </div>
                        <div className="space-y-4">
                            <Laptop className="h-10 w-10 text-secondary mx-auto" />
                            <h4 className="font-bold">Real-time tracking</h4>
                            <p className="text-sm text-gray-400">Advanced GPS and AI-powered monitoring systems.</p>
                        </div>
                        <div className="space-y-4">
                            <ShieldCheck className="h-10 w-10 text-secondary mx-auto" />
                            <h4 className="font-bold">Cargo Insurance</h4>
                            <p className="text-sm text-gray-400">Full coverage for your valuable shipments.</p>
                        </div>
                        <div className="space-y-4">
                            <Truck className="h-10 w-10 text-secondary mx-auto" />
                            <h4 className="font-bold">Last Mile Delivery</h4>
                            <p className="text-sm text-gray-400">Seamless doorstep delivery, anywhere on Earth.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
