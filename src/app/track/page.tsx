"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plane, MapPin, Clock, Calendar, Truck, User, ArrowRight, Package, Search, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Leaflet components to avoid SSR issues
const TrackingMap = dynamic(() => import("@/components/features/TrackingMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

function TrackingContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            fetch(`/api/track/${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Shipment not found");
                    return res.json();
                })
                .then((data) => {
                    setShipment(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !id) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-xl w-full border border-gray-100">
                <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Search className="h-10 w-10 text-secondary" />
                </div>
                <h1 className="text-3xl font-black text-dark mb-4 tracking-tighter uppercase">Track Your Cargo</h1>
                <p className="text-gray-500 mb-10 font-medium">
                    Enter your 10-digit tracking ID to see real-time status and current estimated location.
                </p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.target as any).searchId.value;
                    if (val) window.location.href = `/track?id=${val}`;
                }} className="space-y-4">
                    <input
                        name="searchId"
                        type="text"
                        placeholder="Consignment Number (e.g. AB123456CD)"
                        className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-secondary outline-none transition-all text-center font-bold tracking-widest uppercase placeholder:normal-case placeholder:font-normal"
                    />
                    <Button type="submit" variant="secondary" className="w-full py-4 rounded-2xl font-black tracking-widest">
                        SEARCH SHIPMENT
                    </Button>
                </form>
                <div className="mt-8 pt-8 border-t border-gray-50">
                    <Link href="/" className="text-sm font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-[0.2em]">
                        RETURN TO HOME
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-primary pt-12 pb-16 text-white relative min-h-[320px] flex items-center">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <Link href="/" className="text-white/60 hover:text-white inline-flex items-center text-xs font-black tracking-widest mb-8 transition-colors uppercase">
                            <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> BACK TO PORTAL
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-[0.3em] mb-3 text-secondary">In-Transit Status</h1>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-3">
                                    ID: {shipment.trackingId}
                                </h2>
                                <p className="text-white/70 font-medium text-sm">Real-time global monitoring active for this consignment.</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const val = (e.target as any).miniSearch.value;
                                if (val) window.location.href = `/track?id=${val}`;
                            }} className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex border border-white/20 w-full lg:w-[360px]">
                                <input
                                    name="miniSearch"
                                    placeholder="Enter another ID..."
                                    className="bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-white/40 flex-grow font-bold uppercase tracking-widest text-sm"
                                />
                                <Button size="sm" variant="secondary">TRACK</Button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-[-20deg] translate-x-12" />
            </div>

            <div className="container mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Map Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="h-[450px] bg-gray-100 relative">
                                <TrackingMap shipment={shipment} />
                            </div>
                            <div className="p-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-secondary/10 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Origin</p>
                                        <p className="text-lg font-bold text-dark leading-tight">{shipment.takeoffLocation}</p>
                                        <p className="text-sm text-gray-400 mt-2">{new Date(shipment.takeoffTime).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 border-l-0 md:border-l border-gray-100 md:pl-8">
                                    <div className="bg-success/10 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                        <p className="text-lg font-bold text-dark leading-tight">{shipment.deliveryLocation}</p>
                                        <p className="text-sm text-gray-400 mt-2">{new Date(shipment.deliveryTime).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content & Description */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h3 className="text-xl font-black text-dark mb-6 border-b pb-4 border-gray-50 flex items-center">
                                <Package className="mr-3 text-secondary" /> SHIPMENT DETAILS
                            </h3>
                            <div className="flex flex-col md:flex-row gap-8">
                                {shipment.imageUrl && (
                                    <div className="w-full md:w-1/3">
                                        <img
                                            src={shipment.imageUrl}
                                            alt={shipment.productName}
                                            className="w-full h-48 object-cover rounded-xl shadow-md"
                                        />
                                    </div>
                                )}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 flex-grow ${shipment.imageUrl ? "" : "w-full"}`}>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase mb-1">Product Name</p>
                                        <p className="text-dark font-bold">{shipment.productName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase mb-1">Courier Service</p>
                                        <p className="text-dark font-bold">{shipment.courier || "Standard Global"}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-black text-gray-400 uppercase mb-1">Description</p>
                                        <p className="text-gray-600 leading-relaxed">{shipment.description || "No description provided."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h3 className="text-lg font-black text-dark mb-6 border-b pb-4 border-gray-50 flex items-center">
                                <User className="mr-3 text-secondary" /> PARTIES INVOLVED
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <p className="text-xs font-black text-secondary uppercase tracking-widest mb-3">Sender</p>
                                    <div className="space-y-2">
                                        <p className="text-dark font-bold">{shipment.senderName}</p>
                                        {shipment.senderPhone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" /> {shipment.senderPhone}
                                            </p>
                                        )}
                                        {shipment.senderAddress && <p className="text-sm text-gray-500">{shipment.senderAddress}</p>}
                                        {shipment.senderEmail && <p className="text-sm text-gray-500">{shipment.senderEmail}</p>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <p className="text-xs font-black text-success uppercase tracking-widest mb-3">Receiver</p>
                                    <div className="space-y-2">
                                        <p className="text-dark font-bold">{shipment.recipientName}</p>
                                        {shipment.recipientPhone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" /> {shipment.recipientPhone}
                                            </p>
                                        )}
                                        {shipment.recipientAddress && <p className="text-sm text-gray-500">{shipment.recipientAddress}</p>}
                                        {shipment.recipientEmail && <p className="text-sm text-gray-500">{shipment.recipientEmail}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Status Summary */}
                        <div className="bg-dark rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                            <Plane className="absolute -right-4 -top-4 h-24 w-24 text-white/5 transform -rotate-45" />
                            <h3 className="text-lg font-black mb-6 border-l-4 border-secondary pl-3">TIME LOG</h3>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center space-x-4">
                                    <Clock className="h-5 w-5 text-secondary" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Estimated Arrival</p>
                                        <p className="text-sm font-bold">{new Date(shipment.deliveryTime).toDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Calendar className="h-5 w-5 text-secondary" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Booked On</p>
                                        <p className="text-sm font-bold">{new Date(shipment.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TrackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Tracking...</div>}>
            <TrackingContent />
        </Suspense>
    );
}


