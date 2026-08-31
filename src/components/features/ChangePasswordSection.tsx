"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Password changed successfully" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                setMessage({ type: "error", text: data.error || "Failed to change password" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "An error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
            <h3 className="text-xl font-black text-dark mb-6 flex items-center">
                <Lock className="mr-3 text-secondary" /> SECURITY SETTINGS
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <div className={`p-4 rounded-xl flex items-center space-x-3 border ${message.type === "success" ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
                        }`}>
                        {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-secondary outline-none transition-colors"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                    {loading ? "CHANGING..." : "UPDATE PASSWORD"}
                </Button>
            </form>
        </div>
    );
}
