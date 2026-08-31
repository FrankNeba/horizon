"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
// import { generateTrackingId } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Package, MapPin, Clock, User, Info, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MapPicker = dynamic(() => import("@/components/features/MapPicker"), { ssr: false });

export function AddShipmentForm({
    onSuccess,
    shipment
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
        recipientName: shipment?.recipientName || "",
        recipientAddress: shipment?.recipientAddress || "",
        recipientEmail: shipment?.recipientEmail || "",
        status: shipment?.status || "Pending",
        imageUrl: shipment?.imageUrl || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = shipment
                ? `/api/admin/shipments/${shipment.id}`
                : "/api/admin/shipments";
            const method = shipment ? "PUT" : "POST";

            const payload = { ...formData };
            // trackingId is now generated on the server

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSuccess();
                // Reset form or handle success
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12" >
            {/* Product Information */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-dark mb-6 flex items-center">
                    <Package className="mr-3 text-secondary" /> PRODUCT DETAILS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase">Product Name</label>
                        <input
                            required
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                            value={formData.productName}
                            onChange={(e) => updateField("productName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase">Courier</label>
                        <input
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                            value={formData.courier}
                            onChange={(e) => updateField("courier", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase">Status</label>
                        <select
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none appearance-none bg-white"
                            value={formData.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Returned">Returned</option>
                            <option value="Held">Held</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase">Product Image</label>
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
                                            const fileExt = file.name.split('.').pop();
                                            const fileName = `${Math.random()}.${fileExt}`;
                                            const filePath = `${fileName}`;

                                            // 1. Upload
                                            const { error: uploadError } = await supabase.storage
                                                .from('images')
                                                .upload(filePath, file);

                                            if (uploadError) throw uploadError;

                                            // 2. Get Public URL
                                            const { data } = supabase.storage
                                                .from('images')
                                                .getPublicUrl(filePath);

                                            updateField("imageUrl", data.publicUrl);
                                        } catch (error) {
                                            console.error('Error uploading image:', error);
                                            alert('Error uploading image!');
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                                    Upload Photo (Max 2MB)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase">Description</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Logistics Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departure */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-dark mb-6 flex items-center">
                        <MapPin className="mr-3 text-secondary" /> TAKEOFF
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Location Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                                value={formData.takeoffLocation}
                                onChange={(e) => updateField("takeoffLocation", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Departure Time</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                                value={formData.takeoffTime}
                                onChange={(e) => updateField("takeoffTime", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Coordinates (Click Map)</label>
                            <MapPicker onSelect={(lat, lng) => {
                                updateField("takeoffLat", lat);
                                updateField("takeoffLng", lng);
                            }} />
                            <div className="flex gap-4 text-xs font-mono text-gray-400 mt-2">
                                <span>Lat: {formData.takeoffLat.toFixed(4)}</span>
                                <span>Lng: {formData.takeoffLng.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrival */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-dark mb-6 flex items-center">
                        <MapPin className="mr-3 text-success" /> DELIVERY
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Location Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                                value={formData.deliveryLocation}
                                onChange={(e) => updateField("deliveryLocation", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Delivery Time</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none"
                                value={formData.deliveryTime}
                                onChange={(e) => updateField("deliveryTime", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Coordinates (Click Map)</label>
                            <MapPicker onSelect={(lat, lng) => {
                                updateField("deliveryLat", lat);
                                updateField("deliveryLng", lng);
                            }} />
                            <div className="flex gap-4 text-xs font-mono text-gray-400 mt-2">
                                <span>Lat: {formData.deliveryLat.toFixed(4)}</span>
                                <span>Lng: {formData.deliveryLng.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-dark mb-6 flex items-center">
                        <User className="mr-3 text-secondary" /> SENDER INFO
                    </h3>
                    <div className="space-y-6">
                        <input placeholder="Name" required className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.senderName} onChange={e => updateField("senderName", e.target.value)} />
                        <input placeholder="Address" className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.senderAddress} onChange={e => updateField("senderAddress", e.target.value)} />
                        <input placeholder="Email" className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.senderEmail} onChange={e => updateField("senderEmail", e.target.value)} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-dark mb-6 flex items-center">
                        <User className="mr-3 text-success" /> RECIPIENT INFO
                    </h3>
                    <div className="space-y-6">
                        <input placeholder="Name" required className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.recipientName} onChange={e => updateField("recipientName", e.target.value)} />
                        <input placeholder="Address" className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.recipientAddress} onChange={e => updateField("recipientAddress", e.target.value)} />
                        <input placeholder="Email" className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-primary outline-none" value={formData.recipientEmail} onChange={e => updateField("recipientEmail", e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button disabled={loading} type="submit" size="lg" variant="secondary" className="w-full md:w-auto min-w-[200px]">
                    {loading ? "CREATING..." : "CREATE SHIPMENT"}
                </Button>
            </div>
        </form>
    );
}
