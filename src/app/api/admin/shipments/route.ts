import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateTrackingId(): string {
    
    const first2 = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const middle6 = Array.from({ length: 6 }, () => alphanumeric[Math.floor(Math.random() * alphanumeric.length)]).join("");
    const last2 = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    return `${first2}${middle6}${last2}`;
}

export async function GET() {
    try {
        const shipments = await prisma.shipment.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(shipments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Convert strings to Date objects
        data.takeoffTime = new Date(data.takeoffTime);
        data.deliveryTime = new Date(data.deliveryTime);

        // Generate trackingId on the server if not present
        if (!data.trackingId) {
            data.trackingId = generateTrackingId();
        }

        const shipment = await prisma.shipment.create({
            data,
        });

        return NextResponse.json(shipment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
