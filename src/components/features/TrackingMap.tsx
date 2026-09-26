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

/** Calculate compass bearing (degrees) from point A to point B */
function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLng = toRad(lng2 - lng1);
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const y = Math.sin(dLng) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360; // normalise to 0-360
}

/** Build a rotated plane DivIcon so the plane faces the direction of travel */
function makePlaneIcon(bearingDeg: number): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `
            <div style="
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(${bearingDeg}deg);
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
            ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="#1a56db">
                    <!-- Pointing UP (north) by default; CSS rotation handles direction -->
                    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                </svg>
            </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

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
        const interval = setInterval(calculatePosition, 5000);
        return () => clearInterval(interval);
    }, [shipment]);

    const center = useMemo(() => currentPos, [currentPos]);

    // Compute bearing from takeoff → destination so the plane faces the right way
    const bearing = useMemo(
        () => getBearing(shipment.takeoffLat, shipment.takeoffLng, shipment.deliveryLat, shipment.deliveryLng),
        [shipment.takeoffLat, shipment.takeoffLng, shipment.deliveryLat, shipment.deliveryLng]
    );

    const planeIcon = useMemo(() => makePlaneIcon(bearing), [bearing]);

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
