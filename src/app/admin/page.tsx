"use client";

import { useEffect, useState } from "react";
import { AddShipmentForm } from "@/components/features/AddShipmentForm";
import { ChangePasswordSection } from "@/components/features/ChangePasswordSection";
import {
    Package, Plus, List, LayoutDashboard, Truck, CheckCircle, Clock,
    Settings, LogOut, Edit, Trash2, ArrowLeft, Copy, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [view, setView] = useState<"overview" | "add" | "list" | "edit" | "settings">("overview");
    const [shipments, setShipments] = useState<any[]>([]);
    const [editingShipment, setEditingShipment] = useState<any>(null);
    const router = useRouter();

    const fetchShipments = async () => {
        const res = await fetch("/api/admin/shipments");
        if (res.ok) {
            const data = await res.json();
            setShipments(data);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this shipment?")) {
            const res = await fetch(`/api/admin/shipments/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchShipments();
            }
        }
    };

    const handleEdit = (shipment: any) => {
        setEditingShipment(shipment);
        setView("edit");
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-50 flex relative">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-dark text-white z-50 px-4 py-3 flex justify-between items-center shadow-md">
                <span className="font-black tracking-tighter text-secondary">ADMIN PANEL</span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 w-64 bg-dark text-white flex flex-col pt-8 z-40 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="px-6 mb-12 hidden md:block">
                    <h1 className="text-xl font-black tracking-tighter text-secondary leading-none">ADMIN PANEL</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Logistics Group</p>
                </div>

                <nav className="flex-grow space-y-2 px-4 mt-12 md:mt-0">
                    {[
                        { id: "overview", label: "OVERVIEW", icon: LayoutDashboard },
                        { id: "list", label: "SHIPMENTS", icon: List },
                        { id: "add", label: "ADD PRODUCT", icon: Plus },
                        { id: "settings", label: "SETTINGS", icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id as any);
                                setEditingShipment(null);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-bold text-sm ${view === item.id ? "bg-secondary text-white" : "text-gray-400 hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors font-bold text-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>LOGOUT</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-12 overflow-y-auto pt-20 md:pt-12 w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
                    <div className="flex items-center space-x-4">
                        {view === "edit" && (
                            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="h-6 w-6 text-dark" />
                            </button>
                        )}
                        <h2 className="text-3xl font-black text-dark tracking-tighter uppercase">
                            {view === "overview" && "Dashboard Overview"}
                            {view === "add" && "Create New Shipment"}
                            {view === "list" && "All Shipments"}
                            {view === "edit" && "Edit Shipment"}
                            {view === "settings" && "Account Settings"}
                        </h2>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">System Active</span>
                    </div>
                </header>

                {view === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Package className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-4xl font-black text-dark mb-1">{shipments.length}</p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Shipments</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-orange-500" />
                            </div>
                            <p className="text-4xl font-black text-dark mb-1">
                                {shipments.filter(s => s.status === "Pending" || s.status === "In Transit").length}
                            </p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Orders</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-4xl font-black text-dark mb-1">
                                {shipments.filter(s => s.status === "Delivered").length}
                            </p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Completed</p>
                        </div>
                    </div>
                )}

                {view === "add" && (
                    <AddShipmentForm onSuccess={() => {
                        fetchShipments();
                        setView("list");
                    }} />
                )}

                {view === "edit" && editingShipment && (
                    <AddShipmentForm
                        shipment={editingShipment}
                        onSuccess={() => {
                            fetchShipments();
                            setView("list");
                            setEditingShipment(null);
                        }}
                    />
                )}

                {view === "settings" && <ChangePasswordSection />}

                {view === "list" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-scroll">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tracking ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {shipments.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-sm font-mono text-secondary">
                                            <div className="flex items-center space-x-2">
                                                <span>{shipment.trackingId}</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(shipment.trackingId)}
                                                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-dark transition-colors"
                                                    title="Copy ID"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-dark">{shipment.productName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                                    shipment.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {shipment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{shipment.recipientName}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2  opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(shipment)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(shipment.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {shipments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                            No shipments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
