"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const planeIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/0/614.png", // Small plane icon
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

export default function TrackingMap({ shipment }: { shipment: any }) {
    const [currentPos, setCurrentPos] = useState<[number, number]>([shipment.takeoffLat, shipment.takeoffLng]);

    useEffect(() => {
        const calculatePosition = () => {
            const start = new Date(shipment.takeoffTime).getTime();
            const end = new Date(shipment.deliveryTime).getTime();
            const now = Date.now();

            if (now <= start) {
                setCurrentPos([shipment.takeoffLat, shipment.takeoffLng]);
            } else if (now >= end) {
                setCurrentPos([shipment.deliveryLat, shipment.deliveryLng]);
            } else {
                const progress = (now - start) / (end - start);
                const lat = shipment.takeoffLat + (shipment.deliveryLat - shipment.takeoffLat) * progress;
                const lng = shipment.takeoffLng + (shipment.deliveryLng - shipment.takeoffLng) * progress;
                setCurrentPos([lat, lng]);
            }
        };

        calculatePosition();
        const interval = setInterval(calculatePosition, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, [shipment]);

    const center = useMemo(() => currentPos, [currentPos]);

    return (
        <MapContainer
            center={center}
            zoom={4}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />
            <Polyline
                positions={[
                    [shipment.takeoffLat, shipment.takeoffLng],
                    [shipment.deliveryLat, shipment.deliveryLng],
                ]}
                color="#DAA520"
                dashArray="10, 10"
                weight={2}
            />
            <Marker position={[shipment.takeoffLat, shipment.takeoffLng]} icon={icon}>
                <Popup>Origin: {shipment.takeoffLocation}</Popup>
            </Marker>
            <Marker position={[shipment.deliveryLat, shipment.deliveryLng]} icon={icon}>
                <Popup>Destination: {shipment.deliveryLocation}</Popup>
            </Marker>
            <Marker position={currentPos} icon={planeIcon}>
                <Popup>Current Location (Estimated)</Popup>
            </Marker>
            <RecenterMap position={center} />
        </MapContainer>
    );
}
