import { create } from "zustand";
import { Shipment } from "@prisma/client";

interface ShipmentStore {
    shipments: Shipment[];
    activeShipment: Shipment | null;
    setShipments: (shipments: Shipment[]) => void;
    setActiveShipment: (shipment: Shipment | null) => void;
    addShipment: (shipment: Shipment) => void;
    updateShipment: (id: string, shipment: Partial<Shipment>) => void;
}

export const useShipmentStore = create<ShipmentStore>((set) => ({
    shipments: [],
    activeShipment: null,
    setShipments: (shipments) => set({ shipments }),
    setActiveShipment: (activeShipment) => set({ activeShipment }),
    addShipment: (shipment) =>
        set((state) => ({ shipments: [...state.shipments, shipment] })),
    updateShipment: (id, updatedFields) =>
        set((state) => ({
            shipments: state.shipments.map((s) =>
                s.id === id ? { ...s, ...updatedFields } : s
            ),
            activeShipment:
                state.activeShipment?.id === id
                    ? { ...state.activeShipment, ...updatedFields }
                    : state.activeShipment,
        })),
}));
