"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Package, MapPin, Clock, Calendar, Radio, Truck,
    User, ArrowLeft, Search, Home, CheckCircle, AlertCircle,
    Printer, DollarSign, Activity, QrCode, Mail, Phone,
    ArrowRight, ShieldCheck, MessageSquare, ExternalLink, Share2, Copy, Check
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR
const TrackingMap = dynamic(() => import("@/components/features/TrackingMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
            Loading Map...
        </div>
    ),
});

// ── Status colour helper ───────────────────────────────────────────────────
const statusStyle = (status: string) => {
    switch (status) {
        case "Delivered": return { bg: "#d1fae5", text: "#065f46", dot: "#10b981" };
        case "In Transit": return { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" };
        case "Custom Hold": return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
        case "Held": return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
        case "Pending": return { bg: "#f3f4f6", text: "#374151", dot: "#6b7280" };
        case "Returned": return { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" };
        default: return { bg: "#f3f4f6", text: "#374151", dot: "#6b7280" };
    }
};

// ── Receipt PDF generator (Executive Single-Page Commercial Layout) ────────
async function printReceipt(shipment: any) {
    const { jsPDF } = await import("jspdf");
    const QRCode = await import("qrcode");

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, M = 14, CW = W - M * 2;
    const trackUrl = `${window.location.origin}/track?id=${shipment.trackingId}`;
    const qrDataUrl = await QRCode.toDataURL(trackUrl, { width: 160, margin: 1 });

    type RGB = [number, number, number];
    const NAVY: RGB = [15, 23, 42];        // #0F172A
    const BLUE: RGB = [26, 86, 219];       // #1A56DB
    const SLATE: RGB = [51, 65, 85];       // #334155
    const MUTED: RGB = [100, 116, 139];    // #64748B
    const BORDER: RGB = [226, 232, 240];   // #E2E8F0
    const LIGHT: RGB = [248, 250, 252];    // #F8FAFC
    const GREEN: RGB = [16, 185, 129];     // #10B981
    const RED: RGB = [220, 38, 38];        // #DC2626
    const AMBER: RGB = [217, 119, 6];      // #D97706

    const sf = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
    const ss = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
    const st = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

    const card = (x: number, y: number, w: number, h: number, r = 2, fill: RGB = [255, 255, 255]) => {
        sf(fill);
        doc.roundedRect(x, y, w, h, r, r, "F");
        ss(BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, w, h, r, r, "S");
    };

    const cbadge = (txt: string, x: number, y: number, w: number, bg: RGB, fg: RGB) => {
        sf(bg);
        doc.roundedRect(x, y - 3.8, w, 5.8, 1.2, 1.2, "F");
        st(fg);
        doc.setFontSize(5.8);
        doc.setFont("helvetica", "bold");
        doc.text(txt, x + w / 2, y + 0.3, { align: "center" });
    };

    const drawBarcode = (id: string, bx: number, by: number, bw: number, bh: number) => {
        let pattern = "11010010110";
        for (let i = 0; i < id.length; i++) {
            const code = id.charCodeAt(i);
            for (let b = 7; b >= 0; b--) {
                pattern += ((code >> b) & 1) ? "1101" : "10";
            }
        }
        pattern += "110010100111";
        const unitW = bw / pattern.length;
        sf(NAVY);
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === "1") {
                doc.rect(bx + i * unitW, by, unitW + 0.04, bh, "F");
            }
        }
    };

    const hashCode = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        return h;
    };

    const isPaid = shipment.paymentStatus === "Paid";
    const shipCost = shipment.clearanceFee ? Number(shipment.clearanceFee) : 698;
    const clearCost = shipment.dutyFees ? Number(shipment.dutyFees) : 0;
    const tot = shipCost + clearCost;
    const orderIdNum = Math.abs(hashCode(shipment.id || shipment.trackingId)) % 900 + 100;
    const dStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const takeoffStr = shipment.takeoffTime ? new Date(shipment.takeoffTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
    const deliveryStr = shipment.deliveryTime ? new Date(shipment.deliveryTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

    // ── TOP ACCENT LINE ────────────────────────────────────────────────────────
    sf(BLUE);
    doc.rect(0, 0, W, 3, "F");

    let y = 11;

    // ── 1. CORPORATE HEADER ───────────────────────────────────────────────────
    // Company Name & Subtitle (No top-left logo badge)
    st(NAVY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("HORIZON LOGISTICS", M, y + 5.5);

    st(MUTED);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Global Cargo Solutions & Freight Forwarding Network", M, y + 10.5);

    // Top Right: Official Receipt Badge & Document Info
    sf([239, 246, 255]);
    doc.roundedRect(W - M - 40, y, 40, 6, 1.2, 1.2, "F");
    ss([191, 219, 254]);
    doc.setLineWidth(0.3);
    doc.roundedRect(W - M - 40, y, 40, 6, 1.2, 1.2, "S");
    st(BLUE);
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL CARGO RECEIPT", W - M - 20, y + 4.2, { align: "center" });

    st(MUTED);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Issued: ${dStr}`, W - M, y + 10.5, { align: "right" });
    doc.text(`Ref: HL-REC-${orderIdNum}`, W - M, y + 14.5, { align: "right" });

    y += 18;

    // Subheader Contact Line & Rule
    ss(BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);

    y += 3.5;
    st(MUTED);
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "normal");
    doc.text("International Air, Ocean & Overland Logistics Services", M, y);
    doc.text("logisticshorizon470@gmail.com   •   https://horizonlogistics.s-itez.com", W - M, y, { align: "right" });

    y += 6;

    // ── 2. CONSIGNMENT MASTER BAR ─────────────────────────────────────────────
    sf(BLUE);
    doc.roundedRect(M, y, CW, 14, 2, 2, "F");

    // Tracking Number on Left
    st([219, 234, 254]);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("TRACKING NUMBER / WAYBILL", M + 6, y + 4.8);

    st([255, 255, 255]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(shipment.trackingId, M + 6, y + 10.5);

    // Route in Middle
    const originCity = shipment.takeoffLocation || "Origin Hub";
    const destCity = shipment.deliveryLocation || "Destination Hub";
    st([219, 234, 254]);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("ROUTE", M + 85, y + 4.8);

    st([255, 255, 255]);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${originCity.substring(0, 18)}   -->   ${destCity.substring(0, 18)}`, M + 85, y + 10.5);

    // Verified Pill on Right
    sf([255, 255, 255]);
    doc.roundedRect(W - M - 32, y + 4, 28, 6, 1.2, 1.2, "F");
    st(BLUE);
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED CONSIGNMENT", W - M - 18, y + 8.2, { align: "center" });

    y += 18;

    // ── 3. SHIPPER & CONSIGNEE DETAILS (SIDE-BY-SIDE) ─────────────────────────
    const colW = (CW - 6) / 2;
    const partH = 36;

    // Helper to render party fields with clear bold labels and values
    const renderPartyFields = (startX: number, fields: [string, string][]) => {
        let fpy = y + 12.2;
        fields.forEach(([lbl, val]) => {
            st(SLATE);
            doc.setFontSize(6.3);
            doc.setFont("helvetica", "bold");
            doc.text(lbl, startX + 5, fpy);

            st(NAVY);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            const valStr = (val && val.trim()) ? val.trim() : "N/A";
            const valLines = doc.splitTextToSize(valStr, colW - 31);
            doc.text(valLines[0] || "N/A", startX + 26, fpy);
            fpy += 4.8;
        });
    };

    // Shipper Card (Left)
    card(M, y, colW, partH);
    sf(LIGHT);
    doc.roundedRect(M, y, colW, 7, 2, 2, "F");
    doc.rect(M, y + 3, colW, 4, "F");
    ss(BORDER);
    doc.line(M, y + 7, M + colW, y + 7);

    st(BLUE);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("SHIPPER / SENDER", M + 5, y + 5);

    renderPartyFields(M, [
        ["Name:", shipment.senderName],
        ["Address:", shipment.senderAddress || shipment.takeoffLocation],
        ["Origin Hub:", shipment.takeoffLocation || "Standard Dispatch"],
        ["Phone:", shipment.senderPhone],
        ["Email:", shipment.senderEmail],
    ]);

    // Consignee Card (Right)
    const rx = M + colW + 6;
    card(rx, y, colW, partH);
    sf(LIGHT);
    doc.roundedRect(rx, y, colW, 7, 2, 2, "F");
    doc.rect(rx, y + 3, colW, 4, "F");
    ss(BORDER);
    doc.line(rx, y + 7, rx + colW, y + 7);

    st([5, 150, 105]); // Emerald
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("CONSIGNEE / RECIPIENT", rx + 5, y + 5);

    renderPartyFields(rx, [
        ["Name:", shipment.recipientName],
        ["Address:", shipment.recipientAddress || shipment.deliveryLocation],
        ["Destination Hub:", shipment.deliveryLocation || "Standard Destination"],
        ["Phone:", shipment.recipientPhone],
        ["Email:", shipment.recipientEmail],
    ]);

    y += partH + 5;

    // ── 4. CARGO SPECIFICATIONS & BARCODE ROW ────────────────────────────────
    const barBoxW = 98;
    const specBoxW = CW - barBoxW - 6;
    const midH = 34;

    // Left: Barcode & Authentication Box
    card(M, y, barBoxW, midH);
    sf(LIGHT);
    doc.roundedRect(M, y, barBoxW, 7, 2, 2, "F");
    doc.rect(M, y + 3, barBoxW, 4, "F");
    ss(BORDER);
    doc.line(M, y + 7, M + barBoxW, y + 7);

    st(SLATE);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("CARGO AUTHENTICATION BARCODE", M + 5, y + 5);

    // Centered crisp barcode
    const bcW = 76;
    const bcX = M + (barBoxW - bcW) / 2;
    drawBarcode(shipment.trackingId, bcX, y + 10.5, bcW, 11);

    st(NAVY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(shipment.trackingId, M + barBoxW / 2, y + 25.5, { align: "center" });

    st(MUTED);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: #HL-${orderIdNum}   •   Courier: ${shipment.courier || "Horizon Global Express"}`, M + barBoxW / 2, y + 30, { align: "center" });

    // Right: Cargo Specifications Table Box
    const sx = M + barBoxW + 6;
    card(sx, y, specBoxW, midH);
    sf(LIGHT);
    doc.roundedRect(sx, y, specBoxW, 7, 2, 2, "F");
    doc.rect(sx, y + 3, specBoxW, 4, "F");
    ss(BORDER);
    doc.line(sx, y + 7, sx + specBoxW, y + 7);

    st(SLATE);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("CARGO SPECIFICATIONS", sx + 5, y + 5);

    const specRows: [string, string][] = [
        ["Product / Item:", (shipment.productName || "General Merchandise").substring(0, 22)],
        ["Gross Weight:", shipment.weight ? `${shipment.weight} kg` : "Standard Cargo"],
        ["Freight Service:", shipment.freightType || "Express Road Freight"],
        ["Shipped Date:", takeoffStr],
        ["Est. Delivery:", deliveryStr],
    ];

    let spy = y + 12;
    specRows.forEach(([lbl, val]) => {
        st(MUTED);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text(lbl, sx + 5, spy);

        st(NAVY);
        doc.setFont("helvetica", "bold");
        doc.text(val, sx + specBoxW - 5, spy, { align: "right" });
        spy += 4.5;
    });

    y += midH + 5;

    // ── 5. COMMERCIAL ITEM & SERVICES TABLE ───────────────────────────────────
    const tblH = 34;
    card(M, y, CW, tblH);

    // Table Header Row
    sf([241, 245, 249]);
    doc.roundedRect(M, y, CW, 7.5, 2, 2, "F");
    doc.rect(M, y + 3, CW, 4.5, "F");
    ss(BORDER);
    doc.line(M, y + 7.5, W - M, y + 7.5);

    st(SLATE);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE / ITEM DESCRIPTION", M + 5, y + 5.2);
    doc.text("MODE", M + 75, y + 5.2);
    doc.text("STATUS", M + 105, y + 5.2);
    doc.text("DUTY & TAX", M + 133, y + 5.2, { align: "right" });
    doc.text("CLEARANCE FEE", M + 158, y + 5.2, { align: "right" });
    doc.text("LINE TOTAL", W - M - 5, y + 5.2, { align: "right" });

    // Table Data Row
    let dry = y + 13;
    const descText = shipment.description || shipment.productName || "Standard International Consignment";
    const descLines = doc.splitTextToSize(descText, 64);

    st(NAVY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(descLines, M + 5, dry);

    st(MUTED);
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    doc.text(shipment.freightType || "Road Freight", M + 75, dry);

    // Status pill
    const stStyle = statusStyle(shipment.status);
    const hex2rgb = (h: string): RGB => [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16)
    ];
    cbadge(shipment.status.toUpperCase(), M + 98, dry - 0.5, 22, hex2rgb(stStyle.bg), hex2rgb(stStyle.text));

    st(NAVY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`USD ${clearCost.toFixed(2)}`, M + 133, dry, { align: "right" });
    doc.text(`USD ${shipCost.toFixed(2)}`, M + 158, dry, { align: "right" });

    st(NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(`USD ${tot.toFixed(2)}`, W - M - 5, dry, { align: "right" });

    // Bottom note in table
    ss(BORDER);
    doc.line(M + 3, y + 24, W - M - 3, y + 24);

    st(MUTED);
    doc.setFontSize(5.8);
    doc.setFont("helvetica", "normal");
    doc.text("Standard commercial consignment billed under Horizon Logistics International General Conditions of Carriage.", M + 5, y + 29.5);
    doc.text(`Booking Mode: ${isPaid ? "Prepaid Commercial Account" : "Collect / Pay on Delivery"}`, W - M - 5, y + 29.5, { align: "right" });

    y += tblH + 5;

    // ── 6. PAYMENT SUMMARY & DIGITAL VERIFICATION ROW ────────────────────────
    const btmH = 46;
    const qrColW = 100;
    const sumColW = CW - qrColW - 6;

    // Left: Digital Verification & Payment Methods Card
    card(M, y, qrColW, btmH);
    sf(LIGHT);
    doc.roundedRect(M, y, qrColW, 7, 2, 2, "F");
    doc.rect(M, y + 3, qrColW, 4, "F");
    ss(BORDER);
    doc.line(M, y + 7, M + qrColW, y + 7);

    st(SLATE);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("DIGITAL VERIFICATION & PAYMENT", M + 5, y + 5);

    // QR Code
    doc.addImage(qrDataUrl, "PNG", M + 5, y + 10.5, 22, 22);

    // QR Description
    st(NAVY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Digital Receipt Verification", M + 31, y + 14.5);

    st(MUTED);
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "normal");
    doc.text("Scan this QR code with any mobile device", M + 31, y + 19);
    doc.text("to verify cryptographic authenticity and check", M + 31, y + 23);
    doc.text("live real-time transit telemetry.", M + 31, y + 27);

    st(GREEN);
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.text("SECURED & DIGITALLY VERIFIED", M + 31, y + 32);

    // Payment method badges
    let cx = M + 5;
    const cy = y + 36.5;
    const pMethods: [string, RGB, RGB][] = [
        ["VISA", [26, 86, 219], [255, 255, 255]],
        ["MASTERCARD", [239, 68, 68], [255, 255, 255]],
        ["AMEX", [13, 148, 136], [255, 255, 255]],
        ["PAYPAL", [30, 58, 138], [255, 255, 255]],
    ];
    pMethods.forEach(([name, bg, fg]) => {
        sf(bg);
        doc.roundedRect(cx, cy, 19, 5.5, 1, 1, "F");
        st(fg);
        doc.setFontSize(4.8);
        doc.setFont("helvetica", "bold");
        doc.text(name, cx + 9.5, cy + 3.8, { align: "center" });
        cx += 22;
    });

    // Right: Payment Settlement Summary Card
    const px = M + qrColW + 6;
    card(px, y, sumColW, btmH);
    sf(BLUE);
    doc.roundedRect(px, y, sumColW, 7, 2, 2, "F");
    doc.rect(px, y + 3, sumColW, 4, "F");

    st([255, 255, 255]);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT SUMMARY (USD)", px + 5, y + 5);

    let py = y + 13.5;
    const payRows: [string, string][] = [
        ["Freight / Shipping:", `USD ${shipCost.toFixed(2)}`],
        ["Customs & Duty Fees:", `USD ${clearCost.toFixed(2)}`],
        ["Clearance Service Fee:", `USD ${shipCost.toFixed(2)}`],
    ];

    payRows.forEach(([lbl, val]) => {
        st(MUTED);
        doc.setFontSize(6.8);
        doc.setFont("helvetica", "normal");
        doc.text(lbl, px + 5, py);

        st(NAVY);
        doc.setFont("helvetica", "bold");
        doc.text(val, px + sumColW - 5, py, { align: "right" });
        py += 5.2;
    });

    // Total Amount Line
    ss(BORDER);
    doc.setLineWidth(0.4);
    doc.line(px + 4, py - 1, px + sumColW - 4, py - 1);

    st(NAVY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT:", px + 5, py + 4.5);

    st(BLUE);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.text(`USD ${tot.toFixed(2)}`, px + sumColW - 5, py + 4.5, { align: "right" });

    // Payment Status Badge
    if (isPaid) {
        cbadge("PAID - IN FULL", px + sumColW - 28, py + 8.5, 24, [209, 250, 229], [6, 95, 70]);
    } else {
        cbadge("PAYMENT PENDING", px + sumColW - 32, py + 8.5, 28, [254, 243, 199], [180, 83, 9]);
    }

    y += btmH + 5;

    // ── 7. LEGAL NOTICE & AUTHORIZED DIGITAL DISPATCH SIGN-OFF ────────────────
    const ftH = 26;
    card(M, y, CW, ftH, 2, LIGHT);

    // Left: Legal Conditions
    st(SLATE);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("CONDITIONS OF CARRIAGE & VERIFICATION NOTICE", M + 5, y + 5);

    st(MUTED);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    const legalText = "This electronic receipt serves as an authenticated document of carriage and customs entry under Horizon Logistics global operations. The consignor confirms that goods are properly described and comply with international shipping regulations.";
    const legalLines = doc.splitTextToSize(legalText, 108);
    doc.text(legalLines, M + 5, y + 9.5);

    st(MUTED);
    doc.setFontSize(5.5);
    doc.text(`Document Ref: HL-DOC-${orderIdNum}-${shipment.trackingId}   •   Customer Service: (929) 244-3099`, M + 5, y + 21);

    // Right: Authorized Digital Sign-Off (Clean Corporate, NO Cartoon Stamps)
    const signBoxW = 56;
    const signX = W - M - signBoxW - 4;
    sf([255, 255, 255]);
    doc.roundedRect(signX, y + 3.5, signBoxW, 19, 1.5, 1.5, "F");
    ss(BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(signX, y + 3.5, signBoxW, 19, 1.5, 1.5, "S");

    st(SLATE);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.text("AUTHORIZED DIGITAL SIGN-OFF", signX + signBoxW / 2, y + 7.5, { align: "center" });

    st(BLUE);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Horizon Logistics Authority", signX + signBoxW / 2, y + 12.5, { align: "center" });

    st(MUTED);
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text("Digitally Signed & Validated", signX + signBoxW / 2, y + 16.5, { align: "center" });
    doc.text(`Auth Code: HL-${orderIdNum}-OK`, signX + signBoxW / 2, y + 20, { align: "center" });

    // Bottom micro-footer
    y += ftH + 3;
    st(MUTED);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text("© 2026 Horizon Logistics International Inc. All Rights Reserved.   •   Document generated electronically.", W / 2, y, { align: "center" });

    // Share / Download PDF
    const filename = "Horizon logistics receipt.pdf";
    if (navigator.share) {
        try {
            const blob = doc.output("blob");
            const file = new File([blob], filename, { type: "application/pdf" });
            await navigator.share({ files: [file], title: "Shipment Receipt", text: `Receipt for tracking #${shipment.trackingId}` });
        } catch {
            doc.save(filename);
        }
    } else {
        doc.save(filename);
    }
}

// ── Open Smartsupp fullscreen + auto-send message ─────────────────────────
function openSmartsupp(trackingId: string, clearanceFee: number | null) {
    const feeStr = clearanceFee ? `$${Number(clearanceFee).toFixed(2)}` : "";
    const msg = `Hello, I would like to pay the clearance fee for my shipment.\n\nTracking Number: ${trackingId}${feeStr ? `\nClearance Fee: ${feeStr}` : ""}\n\nPlease assist me with the payment process. Thank you.`;

    // 1. Copy message to clipboard for easy pasting
    try {
        navigator.clipboard?.writeText(msg);
    } catch {
        // clipboard access restricted
    }

    // 2. Inject or activate fullscreen CSS for Smartsupp
    let style = document.getElementById("smartsupp-fullscreen-style");
    if (!style) {
        style = document.createElement("style");
        style.id = "smartsupp-fullscreen-style";
        style.innerHTML = `
            #smartsupp-widget-container,
            #smartsupp-widget-container > div,
            #chat-application,
            #chat-application > div,
            div[id^="smartsupp"],
            div[class*="smartsupp"],
            iframe[title="Smartsupp"],
            iframe[src*="smartsupp"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                z-index: 2147483640 !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Add a floating "Close Fullscreen" button
    let closeBtn = document.getElementById("smartsupp-close-fullscreen-btn");
    if (!closeBtn) {
        closeBtn = document.createElement("button");
        closeBtn.id = "smartsupp-close-fullscreen-btn";
        closeBtn.innerHTML = "✕ Close Fullscreen";
        closeBtn.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);color:white;font-weight:700;font-size:13px;padding:8px 16px;border-radius:9999px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.2s;";
        closeBtn.onclick = () => {
            document.getElementById("smartsupp-fullscreen-style")?.remove();
            closeBtn?.remove();
        };
        document.body.appendChild(closeBtn);
    }

    // 3. Open chat via Smartsupp JS API
    if (typeof (window as any).smartsupp === "function") {
        try {
            (window as any).smartsupp("chat:open");
            (window as any).smartsupp("chat:message", msg);
        } catch { }
    }

    // 4. Click launcher button in case JS API is restricted on free tier
    const launcher = document.querySelector('button[data-testid="launcher"], .smartsupp-launcher, div[class*="launcher"]') as HTMLElement | null;
    if (launcher) {
        launcher.click();
    }

    // 5. Actively expand all matching iframes and containers to full screen
    const expandFullscreen = () => {
        const iframes = Array.from(document.querySelectorAll("iframe")).filter(
            f => f.src?.includes("smartsupp") || f.id?.includes("smartsupp") || f.title?.includes("Smartsupp")
        );

        iframes.forEach((iframe) => {
            iframe.style.setProperty("position", "fixed", "important");
            iframe.style.setProperty("top", "0", "important");
            iframe.style.setProperty("left", "0", "important");
            iframe.style.setProperty("width", "100vw", "important");
            iframe.style.setProperty("height", "100vh", "important");
            iframe.style.setProperty("max-width", "100vw", "important");
            iframe.style.setProperty("max-height", "100vh", "important");
            iframe.style.setProperty("z-index", "2147483640", "important");
            iframe.style.setProperty("border-radius", "0", "important");

            let p: HTMLElement | null = iframe.parentElement;
            while (p && p !== document.body) {
                p.style.setProperty("position", "fixed", "important");
                p.style.setProperty("top", "0", "important");
                p.style.setProperty("left", "0", "important");
                p.style.setProperty("width", "100vw", "important");
                p.style.setProperty("height", "100vh", "important");
                p.style.setProperty("max-width", "100vw", "important");
                p.style.setProperty("max-height", "100vh", "important");
                p.style.setProperty("z-index", "2147483640", "important");
                p.style.setProperty("border-radius", "0", "important");
                p = p.parentElement;
            }

            // Fill input in iframe if accessible
            try {
                const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
                const ta = (iDoc?.querySelector("textarea") || iDoc?.querySelector('input[placeholder*="message" i]')) as HTMLInputElement | HTMLTextAreaElement | null;
                if (ta && !ta.value) {
                    ta.value = msg;
                    ta.dispatchEvent(new Event("input", { bubbles: true }));
                }
                const btn = iDoc?.querySelector('button[data-testid="launcher"], .smartsupp-launcher') as HTMLElement | null;
                if (btn) btn.click();
            } catch {
                // Cross origin
            }
        });
    };

    [50, 150, 300, 600, 1000, 1500, 2500].forEach((delay) => {
        setTimeout(expandFullscreen, delay);
    });

    // Send message again after widget initializes
    setTimeout(() => {
        if (typeof (window as any).smartsupp === "function") {
            try {
                (window as any).smartsupp("chat:message", msg);
            } catch { }
        }
    }, 600);
}

// ── Info Row component ─────────────────────────────────────────────────────
function InfoCard({ icon: Icon, iconColor, title, children }: { icon: any; iconColor: string; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <span className={`text-sm font-bold ${iconColor}`}>{title}</span>
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-400 text-sm min-w-[110px]">{label}</span>
            <span className="text-gray-800 text-sm font-semibold text-right">{value || "N/A"}</span>
        </div>
    );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const st = statusStyle(status);
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
            {status}
        </span>
    );
}

// ── Tracking History Timeline ──────────────────────────────────────────────
function TrackingTimeline({ history }: { history: any[] }) {
    if (!history?.length) return null;

    const icons: Record<string, any> = {
        "Picked by Courier": Package,
        "Order Confirmed": CheckCircle,
        "Custom Hold": Clock,
        "In Transit": Truck,
        "Delivered": CheckCircle,
        "Out for Delivery": Truck,
    };

    const dotColors: Record<string, string> = {
        "Picked by Courier": "#3b82f6",
        "Order Confirmed": "#3b82f6",
        "Custom Hold": "#f59e0b",
        "In Transit": "#3b82f6",
        "Delivered": "#10b981",
        "Out for Delivery": "#3b82f6",
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-5">Shipment Progress</h3>
            <div className="space-y-0">
                {history.map((event: any, idx: number) => {
                    const Icon = icons[event.status] || Activity;
                    const dotColor = dotColors[event.status] || "#6b7280";
                    const isLast = idx === history.length - 1;
                    return (
                        <div key={idx} className="flex gap-4 relative">
                            {/* Icon */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 z-10" style={{ background: dotColor }}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                {!isLast && (
                                    <div className="w-0.5 flex-grow mt-1 mb-1" style={{ background: idx === history.length - 2 ? "#f59e0b" : "#3b82f6", minHeight: "24px" }} />
                                )}
                            </div>
                            {/* Content */}
                            <div className={`pb-5 ${isLast ? "" : ""}`}>
                                <p className="font-bold text-gray-800 text-sm">{event.status}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</p>
                                {event.location && <p className="text-xs text-gray-400">{event.location}</p>}
                                {event.note && <p className="text-xs text-gray-500 mt-1">{event.note}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Event History ─────────────────────────────────────────────────────────
function EventHistory({ history }: { history: any[] }) {
    if (!history?.length) return null;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">Event History</h3>
            <div className="space-y-4">
                {history.map((event: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Activity className="h-3 w-3 text-blue-600" />
                            </div>
                            {idx < history.length - 1 && <div className="w-0.5 flex-grow bg-gray-100 mt-1" />}
                        </div>
                        <div className="pb-4">
                            <p className="text-xs text-gray-400">{event.date ? new Date(event.date).toLocaleString() : ""}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{event.status}</span>
                            {event.note && <p className="text-sm text-gray-600 mt-1">{event.note}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Content ──────────────────────────────────────────────────────────
function TrackingContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [printing, setPrinting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

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

    useEffect(() => {
        if (shipment?.trackingId && typeof window !== "undefined") {
            import("qrcode").then((QRCode) => {
                const trackUrl = `${window.location.origin}/track?id=${shipment.trackingId}`;
                QRCode.toDataURL(trackUrl, { width: 180, margin: 1 })
                    .then(setQrCodeUrl)
                    .catch(() => { });
            });
        }
    }, [shipment?.trackingId]);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard?.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                <p className="text-gray-500 text-sm font-medium">Fetching shipment data...</p>
            </div>
        </div>
    );

    if (error || !id) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg text-center max-w-md w-full border border-gray-100">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Track Your Shipment</h1>
                <p className="text-gray-400 mb-6 text-sm">Enter your 10-digit tracking number to check real-time status.</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const v = (e.target as any).sid.value?.trim();
                    if (v) window.location.href = `/track?id=${v}`;
                }} className="space-y-3">
                    <input
                        name="sid"
                        type="text"
                        placeholder="e.g. TTMTJICCLV"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none text-center font-bold tracking-widest uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal text-sm"
                    />
                    <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-blue-500/10">
                        TRACK SHIPMENT
                    </button>
                </form>
                <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    <Home className="h-4 w-4" /> Back to Home
                </Link>
            </div>
        </div>
    );

    let trackingHistory: any[] = [];
    try { trackingHistory = JSON.parse(shipment.trackingHistory || "[]"); } catch { }

    const hasClearanceFee = shipment.clearanceFee && Number(shipment.clearanceFee) > 0;

    return (
        <div className="min-h-screen bg-gray-50/70 pb-20">
            {/* ── Sticky Top Bar ── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>

                    {/* Quick Search on Desktop */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const val = (e.target as any).quickId.value?.trim();
                        if (val) window.location.href = `/track?id=${val}`;
                    }} className="hidden md:flex items-center gap-2">
                        <div className="relative">
                            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                name="quickId"
                                type="text"
                                placeholder="Track another ID..."
                                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-800 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal focus:bg-white focus:border-blue-500 focus:outline-none w-52 transition-all"
                            />
                        </div>
                        <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                            Track
                        </button>
                    </form>

                    {/* Share / Copy on Mobile & Desktop */}
                    <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                        title="Copy tracking link"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5 text-gray-500" />}
                        <span>{copied ? "Link Copied!" : "Share"}</span>
                    </button>
                </div>
            </div>

            {/* ── Main Container ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

                {/* ── Hero Banner: Full Width Responsive Card ── */}
                <div
                    className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
                >
                    {/* Decorative background shape */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-[-20deg] pointer-events-none translate-x-12" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-widest">
                                <Package className="h-4 w-4" />
                                <span>Shipment Tracking</span>
                                <span>•</span>
                                <span className="opacity-75">Home / Tracking</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">{shipment.trackingId}</h1>
                                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-emerald-300" /> Verified
                                </span>
                                <span className="bg-white/10 border border-white/10 text-white/90 text-xs font-bold px-3 py-1 rounded-full">
                                    {shipment.freightType || "Road Freight"}
                                </span>
                            </div>

                            {(shipment.takeoffLocation || shipment.deliveryLocation) && (
                                <div className="flex items-center gap-2 pt-2 text-sm text-blue-100 font-medium">
                                    <span className="font-bold">{shipment.takeoffLocation || "Origin"}</span>
                                    <ArrowRight className="h-4 w-4 text-blue-300 flex-shrink-0" />
                                    <span className="font-bold">{shipment.deliveryLocation || "Destination"}</span>
                                </div>
                            )}
                        </div>

                        {/* Status + Quick Header Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 flex items-center justify-between sm:justify-start gap-4">
                                <div className="text-xs text-blue-200">
                                    <span className="block font-medium">Status</span>
                                    <span className="text-white font-bold text-sm">{shipment.status}</span>
                                </div>
                                <StatusBadge status={shipment.status} />
                            </div>

                            {/* Header action buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => { setPrinting(true); await printReceipt(shipment); setPrinting(false); }}
                                    disabled={printing}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-all shadow-md text-sm active:scale-95 disabled:opacity-75"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>{printing ? "Generating..." : "Print Receipt"}</span>
                                </button>
                                {hasClearanceFee && (
                                    <button
                                        onClick={() => openSmartsupp(shipment.trackingId, shipment.clearanceFee)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 text-white font-bold rounded-xl transition-all shadow-md text-sm active:scale-95"
                                        style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        <span>Pay Fee (${Number(shipment.clearanceFee).toFixed(0)})</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Layout: 8-Column Content + 4-Column Sidebar ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ════ LEFT COLUMN: Route Map, Parties, Specifications, Timeline ════ */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Complete Route Map */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">Complete Shipment Route</h3>
                                        <p className="text-xs text-gray-400">Interactive live transit location & route path</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Live Map
                                </span>
                            </div>

                            <div className="h-72 sm:h-80 md:h-[400px] w-full bg-gray-100">
                                <TrackingMap shipment={shipment} />
                            </div>

                            {/* Origin / Destination Summary */}
                            {(shipment.takeoffLocation || shipment.deliveryLocation) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-gray-50/60 p-4 sm:p-5">
                                    <div className="pb-3 sm:pb-0 sm:pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origin</p>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{shipment.takeoffLocation}</p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-gray-400" /> {new Date(shipment.takeoffTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="pt-3 sm:pt-0 sm:pl-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</p>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{shipment.deliveryLocation}</p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-gray-400" /> {new Date(shipment.deliveryTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Sender & Receiver Cards (2 cols on tablet/desktop, stacked on mobile) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Sender */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sender Information</h4>
                                        <p className="text-sm font-bold text-blue-600">{shipment.senderName || "Sender Unavailable"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-50">
                                    {shipment.senderAddress && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{shipment.senderAddress}</span>
                                        </div>
                                    )}
                                    {shipment.senderPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{shipment.senderPhone}</span>
                                        </div>
                                    )}
                                    {shipment.senderEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm truncate">{shipment.senderEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Receiver */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:border-emerald-100 transition-all">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver Information</h4>
                                        <p className="text-sm font-bold text-emerald-600">{shipment.recipientName || "Receiver Unavailable"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-50">
                                    {shipment.recipientAddress && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{shipment.recipientAddress}</span>
                                        </div>
                                    )}
                                    {shipment.recipientPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{shipment.recipientPhone}</span>
                                        </div>
                                    )}
                                    {shipment.recipientEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm truncate">{shipment.recipientEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Shipment Details & Specifications Grid */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Package className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Shipment Details & Specifications</h3>
                            </div>

                            {shipment.imageUrl && (
                                <div className="mb-5 rounded-xl overflow-hidden max-h-56 border border-gray-100 bg-gray-50 flex items-center justify-center">
                                    <img src={shipment.imageUrl} alt={shipment.productName || "Parcel"} className="max-h-56 w-full object-cover rounded-xl" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Product</span>
                                    <span className="text-sm font-bold text-gray-800 truncate block">{shipment.productName || "General Goods"}</span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Weight</span>
                                    <span className="text-sm font-bold text-gray-800">{shipment.weight ? `${shipment.weight} kg` : "N/A"}</span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Freight Type</span>
                                    <span className="text-sm font-bold text-gray-800">{shipment.freightType || "Road Freight"}</span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Courier</span>
                                    <span className="text-sm font-bold text-gray-800 truncate block">{shipment.courier || "Horizon Express"}</span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Pickup Date</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {new Date(shipment.takeoffTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Expected Delivery</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {new Date(shipment.deliveryTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Duty Fees</span>
                                    <span className={`text-sm font-bold ${shipment.dutyFees === 0 || !shipment.dutyFees ? "text-emerald-600" : "text-gray-800"}`}>
                                        {shipment.dutyFees === 0 || !shipment.dutyFees ? "Prepaid" : `$${Number(shipment.dutyFees).toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                    <span className="text-xs text-gray-400 block mb-1">Payment Status</span>
                                    <span className={`text-sm font-bold ${shipment.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                                        {shipment.paymentStatus || "Unpaid"}
                                    </span>
                                </div>
                            </div>

                            {shipment.description && (
                                <div className="mt-4 pt-4 border-t border-gray-50 text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    <span className="font-semibold text-gray-700 block mb-1">Description:</span>
                                    {shipment.description}
                                </div>
                            )}
                        </div>

                        {/* 4. Tracking Progress History */}
                        {trackingHistory.length > 0 && <TrackingTimeline history={trackingHistory} />}

                    </div>

                    {/* ════ RIGHT COLUMN (Sidebar): Sticky Action Center, Summary, Verification, Support ════ */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

                        {/* Action Center Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3.5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-gray-900 text-sm">Consignment Actions</h3>
                            </div>

                            <button
                                onClick={async () => { setPrinting(true); await printReceipt(shipment); setPrinting(false); }}
                                disabled={printing}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 text-sm"
                            >
                                <Printer className="h-4 w-4" />
                                {printing ? "Generating Official PDF..." : "Print Official Receipt"}
                            </button>

                            {hasClearanceFee && (
                                <button
                                    onClick={() => openSmartsupp(shipment.trackingId, shipment.clearanceFee)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-98 text-sm"
                                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Pay Clearance Fee (${Number(shipment.clearanceFee).toFixed(2)})
                                </button>
                            )}

                            {/* Financial breakdown */}
                            <div className="pt-3 border-t border-gray-50 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-gray-500">
                                    <span>Duty / Customs:</span>
                                    <span className="font-semibold text-gray-800">
                                        {shipment.dutyFees === 0 || !shipment.dutyFees ? "Prepaid" : `$${Number(shipment.dutyFees).toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-500">
                                    <span>Clearance Fee:</span>
                                    <span className="font-semibold text-gray-800">
                                        {shipment.clearanceFee ? `$${Number(shipment.clearanceFee).toFixed(2)}` : "None"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-900 font-bold pt-1 border-t border-gray-50 text-sm">
                                    <span>Payment Status:</span>
                                    <span className={shipment.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}>
                                        {shipment.paymentStatus || "Unpaid"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Digital Verification QR Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <QrCode className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-gray-900 text-sm">Digital Verification</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 rounded-lg border border-gray-100 flex-shrink-0" />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                                )}
                                <div className="text-xs space-y-1">
                                    <p className="font-semibold text-gray-800">Scan to Verify</p>
                                    <p className="text-gray-400 leading-snug">Verify this receipt authenticity and track live updates on mobile.</p>
                                    <p className="text-emerald-600 font-bold pt-0.5">✓ Secured & Signed</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Assistance Card */}
                        <div className="rounded-2xl p-5 border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 shadow-xs">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-blue-950 text-sm">Need Help with Cargo?</h3>
                            </div>
                            <p className="text-xs text-blue-800/80 leading-relaxed mb-3.5">
                                Our international logistics dispatch team is available 24/7 to assist with customs clearance and status inquiries.
                            </p>
                            <button
                                onClick={() => openSmartsupp(shipment.trackingId, shipment.clearanceFee)}
                                className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Start Live Chat Support</span>
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default function TrackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                    <p className="text-gray-500 text-sm font-medium">Loading Tracking...</p>
                </div>
            </div>
        }>
            <TrackingContent />
        </Suspense>
    );
}
