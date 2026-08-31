import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const shipment = await prisma.shipment.findUnique({ where: { id } });
        if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(shipment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const data = await request.json();

        // Date conversion
        if (data.takeoffTime) data.takeoffTime = new Date(data.takeoffTime);
        if (data.deliveryTime) data.deliveryTime = new Date(data.deliveryTime);

        const shipment = await prisma.shipment.update({
            where: { id },
            data,
        });
        return NextResponse.json(shipment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.shipment.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
