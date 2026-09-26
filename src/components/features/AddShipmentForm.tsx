"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import { Package, MapPin, User, DollarSign, Clock, Truck, Activity, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MapPicker = dynamic(() => import("@/components/features/MapPicker"), { ssr: false });

// ── Tracking event item ────────────────────────────────────────────────────
interface TrackingEvent {
    status: string;
    date: string;
    location: string;
    note: string;
}

const STATUS_OPTIONS = [
    "Pending",
    "In Transit",
    "Delivered",
    "Returned",
    "Held",
    "Custom Hold",
    "Out for Delivery",
    "Order Confirmed",
    "Picked by Courier",
];

const FREIGHT_TYPES = [
    "Road Freight",
    "Air Freight",
    "Sea Freight",
    "Rail Freight",
    "Express Courier",
];

export function AddShipmentForm({
    onSuccess,
    shipment,
}: {
    onSuccess: () => void;
    shipment?: any;
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productName: shipment?.productName || "",
        description: shipment?.description || "",
        takeoffLocation: shipment?.takeoffLocation || "",
        takeoffLat: shipment?.takeoffLat || 0,
        takeoffLng: shipment?.takeoffLng || 0,
        takeoffTime: shipment?.takeoffTime ? new Date(shipment.takeoffTime).toISOString().slice(0, 16) : "",
        deliveryLocation: shipment?.deliveryLocation || "",
        deliveryLat: shipment?.deliveryLat || 0,
        deliveryLng: shipment?.deliveryLng || 0,
        deliveryTime: shipment?.deliveryTime ? new Date(shipment.deliveryTime).toISOString().slice(0, 16) : "",
        courier: shipment?.courier || "",
        senderName: shipment?.senderName || "",
        senderAddress: shipment?.senderAddress || "",
        senderEmail: shipment?.senderEmail || "",
        senderPhone: shipment?.senderPhone || "",
        recipientName: shipment?.recipientName || "",
        recipientAddress: shipment?.recipientAddress || "",
        recipientEmail: shipment?.recipientEmail || "",
        recipientPhone: shipment?.recipientPhone || "",
        status: shipment?.status || "Pending",
        imageUrl: shipment?.imageUrl || "",
        // New fields
        weight: shipment?.weight ?? "",
        freightType: shipment?.freightType || "Road Freight",
        dutyFees: shipment?.dutyFees ?? "",
        clearanceFee: shipment?.clearanceFee ?? "",
        paymentStatus: shipment?.paymentStatus || "Unpaid",
    });

    // Tracking history events
    const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(() => {
        try { return JSON.parse(shipment?.trackingHistory || "[]"); } catch { return []; }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = shipment
                ? `/api/admin/shipments/${shipment.id}`
                : "/api/admin/shipments";
            const method = shipment ? "PUT" : "POST";

            const payload = {
                ...formData,
                weight: formData.weight !== "" ? Number(formData.weight) : null,
                dutyFees: formData.dutyFees !== "" ? Number(formData.dutyFees) : null,
                clearanceFee: formData.clearanceFee !== "" ? Number(formData.clearanceFee) : null,
                trackingHistory: JSON.stringify(trackingEvents),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ── Tracking event helpers ──
    const addEvent = () => {
        setTrackingEvents((prev) => [
            ...prev,
            { status: "Order Confirmed", date: new Date().toISOString().slice(0, 16), location: "", note: "" },
        ]);
    };

    const removeEvent = (idx: number) => {
        setTrackingEvents((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateEvent = (idx: number, field: keyof TrackingEvent, value: string) => {
        setTrackingEvents((prev) =>
            prev.map((ev, i) => (i === idx ? { ...ev, [field]: value } : ev))
        );
    };

    const inputCls = "w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none text-sm transition-colors";
    const labelCls = "text-xs font-black text-gray-400 uppercase tracking-widest";
    const sectionCls = "bg-white p-6 rounded-2xl shadow-sm border border-gray-100";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Product Information ── */}
            <div className={sectionCls}>
                <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
                    <Package className="text-secondary h-5 w-5" /> PRODUCT DETAILS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className={labelCls}>Product Name *</label>
                        <input required className={inputCls} value={formData.productName} onChange={(e) => updateField("productName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Courier</label>
                        <input className={inputCls} value={formData.courier} onChange={(e) => updateField("courier", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Status</label>
                        <select className={inputCls + " appearance-none bg-white"} value={formData.status} onChange={(e) => updateField("status", e.target.value)}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Freight Type</label>
                        <select className={inputCls + " appearance-none bg-white"} value={formData.freightType} onChange={(e) => updateField("freightType", e.target.value)}>
                            {FREIGHT_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Weight (kg)</label>
                        <input type="number" step="0.01" min="0" placeholder="e.g. 4257" className={inputCls} value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelCls}>Product Image</label>
                        <div className="flex gap-4 items-center">
                            {formData.imageUrl && (
                                <img src={formData.imageUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                            )}
                            <div className="flex-grow">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-secondary transition-colors cursor-pointer text-sm"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const fileExt = file.name.split(".").pop();
                                            const filePath = `${Math.random()}.${fileExt}`;
                                            const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file);
                                            if (uploadError) throw uploadError;
                                            const { data } = supabase.storage.from("images").getPublicUrl(filePath);
                                            updateField("imageUrl", data.publicUrl);
                                        } catch (err) {
                                            console.error("Error uploading image:", err);
                                            alert("Error uploading image!");
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Upload Photo (Max 2MB)</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelCls}>Description</label>
                        <textarea rows={3} className={inputCls} value={formData.description} onChange={(e) => updateField("description", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ── Payment & Fees ── */}
            <div className={sectionCls}>
                <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
                    <DollarSign className="text-secondary h-5 w-5" /> PAYMENT & FEES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className={labelCls}>Duty Fees ($)</label>
                        <input type="number" step="0.01" min="0" placeholder="0 = Prepaid" className={inputCls} value={formData.dutyFees} onChange={(e) => updateField("dutyFees", e.target.value)} />
                        <p className="text-[11px] text-gray-400">Set to 0 to mark as Prepaid</p>
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Clearance Fee ($)</label>
                        <input type="number" step="0.01" min="0" placeholder="e.g. 698.00" className={inputCls} value={formData.clearanceFee} onChange={(e) => updateField("clearanceFee", e.target.value)} />
                        <p className="text-[11px] text-gray-400">Shown on tracking page as payable amount</p>
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Payment Status</label>
                        <div className="flex gap-4 pt-2">
                            {["Unpaid", "Paid"].map((ps) => (
                                <label key={ps} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentStatus"
                                        value={ps}
                                        checked={formData.paymentStatus === ps}
                                        onChange={() => updateField("paymentStatus", ps)}
                                        className="accent-secondary"
                                    />
                                    <span className={`text-sm font-bold ${ps === "Paid" ? "text-green-600" : "text-orange-500"}`}>
                                        {ps === "Paid" ? "✓ Paid" : "⚠ Unpaid"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Logistics ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Takeoff */}
                <div className={sectionCls}>
                    <h3 className="text-lg font-black text-dark mb-5 flex items-center gap-2">
                        <MapPin className="text-secondary h-5 w-5" /> TAKEOFF
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className={labelCls}>Location Name *</label>
                            <input required className={inputCls} value={formData.takeoffLocation} onChange={(e) => updateField("takeoffLocation", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Departure Time *</label>
                            <input required type="datetime-local" className={inputCls} value={formData.takeoffTime} onChange={(e) => updateField("takeoffTime", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Coordinates (Click Map)</label>
                            <MapPicker
                                onSelect={(lat, lng) => { updateField("takeoffLat", lat); updateField("takeoffLng", lng); }}
                                initialLat={Number(formData.takeoffLat)}
                                initialLng={Number(formData.takeoffLng)}
                            />
                            <div className="flex gap-4 text-xs font-mono text-gray-400 mt-1">
                                <span>Lat: {Number(formData.takeoffLat).toFixed(4)}</span>
                                <span>Lng: {Number(formData.takeoffLng).toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery */}
                <div className={sectionCls}>
                    <h3 className="text-lg font-black text-dark mb-5 flex items-center gap-2">
                        <MapPin className="text-green-500 h-5 w-5" /> DELIVERY
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className={labelCls}>Location Name *</label>
                            <input required className={inputCls} value={formData.deliveryLocation} onChange={(e) => updateField("deliveryLocation", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Delivery Time *</label>
                            <input required type="datetime-local" className={inputCls} value={formData.deliveryTime} onChange={(e) => updateField("deliveryTime", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Coordinates (Click Map)</label>
                            <MapPicker
                                onSelect={(lat, lng) => { updateField("deliveryLat", lat); updateField("deliveryLng", lng); }}
                                initialLat={Number(formData.deliveryLat)}
                                initialLng={Number(formData.deliveryLng)}
                            />
                            <div className="flex gap-4 text-xs font-mono text-gray-400 mt-1">
                                <span>Lat: {Number(formData.deliveryLat).toFixed(4)}</span>
                                <span>Lng: {Number(formData.deliveryLng).toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Parties ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={sectionCls}>
                    <h3 className="text-lg font-black text-dark mb-5 flex items-center gap-2">
                        <User className="text-secondary h-5 w-5" /> SENDER INFO
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={labelCls}>Sender Name *</label>
                            <input placeholder="Enter sender name" required className={inputCls} value={formData.senderName} onChange={(e) => updateField("senderName", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Phone Number</label>
                            <input placeholder="e.g. +1 (555) 000-0000" className={inputCls} value={formData.senderPhone} onChange={(e) => updateField("senderPhone", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Address</label>
                            <input placeholder="Street address, city, country" className={inputCls} value={formData.senderAddress} onChange={(e) => updateField("senderAddress", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Email</label>
                            <input placeholder="sender@example.com" type="email" className={inputCls} value={formData.senderEmail} onChange={(e) => updateField("senderEmail", e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className={sectionCls}>
                    <h3 className="text-lg font-black text-dark mb-5 flex items-center gap-2">
                        <User className="text-green-500 h-5 w-5" /> RECIPIENT INFO
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={labelCls}>Recipient Name *</label>
                            <input placeholder="Enter recipient name" required className={inputCls} value={formData.recipientName} onChange={(e) => updateField("recipientName", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Phone Number</label>
                            <input placeholder="e.g. +1 (555) 000-0000" className={inputCls} value={formData.recipientPhone} onChange={(e) => updateField("recipientPhone", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Address</label>
                            <input placeholder="Delivery address, city, country" className={inputCls} value={formData.recipientAddress} onChange={(e) => updateField("recipientAddress", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Email</label>
                            <input placeholder="recipient@example.com" type="email" className={inputCls} value={formData.recipientEmail} onChange={(e) => updateField("recipientEmail", e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tracking History ── */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-dark flex items-center gap-2">
                        <Activity className="text-secondary h-5 w-5" /> TRACKING HISTORY
                    </h3>
                    <button
                        type="button"
                        onClick={addEvent}
                        className="px-4 py-2 bg-secondary text-white text-xs font-black rounded-lg hover:bg-secondary/90 transition-colors uppercase tracking-widest"
                    >
                        + Add Event
                    </button>
                </div>

                {trackingEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                        No tracking events yet. Click &quot;Add Event&quot; to add one.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trackingEvents.map((event, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                                <button
                                    type="button"
                                    onClick={() => removeEvent(idx)}
                                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-bold"
                                >
                                    ✕ Remove
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Status</label>
                                        <select className={inputCls + " appearance-none bg-white"} value={event.status} onChange={(e) => updateEvent(idx, "status", e.target.value)}>
                                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Date & Time</label>
                                        <input type="datetime-local" className={inputCls} value={event.date} onChange={(e) => updateEvent(idx, "date", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Location</label>
                                        <input placeholder="e.g. North Carolina" className={inputCls} value={event.location} onChange={(e) => updateEvent(idx, "location", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Note</label>
                                        <input placeholder="e.g. Package picked up" className={inputCls} value={event.note} onChange={(e) => updateEvent(idx, "note", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Submit ── */}
            <div className="flex justify-end">
                <Button disabled={loading} type="submit" size="lg" variant="secondary" className="w-full md:w-auto min-w-[200px]">
                    {loading ? "SAVING..." : shipment ? "UPDATE SHIPMENT" : "CREATE SHIPMENT"}
                </Button>
            </div>
        </form>
    );
}
