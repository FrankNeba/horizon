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

/** Calculate compass/map bearing (degrees 0-360) so the plane points directly to destination along the map line */
function getMapBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const nLat1 = Number(lat1);
    const nLng1 = Number(lng1);
    const nLat2 = Number(lat2);
    const nLng2 = Number(lng2);

    if (isNaN(nLat1) || isNaN(nLng1) || isNaN(nLat2) || isNaN(nLng2)) return 0;
    if (nLat1 === nLat2 && nLng1 === nLng2) return 0;

    // Use Web Mercator projection matching Leaflet's coordinate space
    if (typeof L !== "undefined" && L.CRS && L.CRS.EPSG3857) {
        try {
            const p1 = L.CRS.EPSG3857.project(L.latLng(nLat1, nLng1));
            const p2 = L.CRS.EPSG3857.project(L.latLng(nLat2, nLng2));
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y; // In EPSG3857, y increases North (upwards)
            const rad = Math.atan2(dx, dy); // 0 at North, 90 at East, 180 at South, 270 at West
            return ((rad * 180) / Math.PI + 360) % 360;
        } catch {
            // fallback below
        }
    }

    // Rhumb-line Mercator formula fallback
    const toRad = (d: number) => (d * Math.PI) / 180;
    let dLng = nLng2 - nLng1;
    while (dLng > 180) dLng -= 360;
    while (dLng < -180) dLng += 360;

    const phi1 = toRad(nLat1);
    const phi2 = toRad(nLat2);
    const dPhi = Math.log(Math.tan(Math.PI / 4 + phi2 / 2) / Math.tan(Math.PI / 4 + phi1 / 2));
    const rad = Math.atan2(toRad(dLng), dPhi);
    return ((rad * 180) / Math.PI + 360) % 360;
}

/** Build a rotated plane DivIcon so the plane faces the direction of travel */
function makePlaneIcon(bearingDeg: number): L.DivIcon {
    return L.divIcon({
        className: "!bg-transparent !border-0 tracking-plane-marker",
        html: `
            <div style="
                width: 38px;
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(${bearingDeg.toFixed(1)}deg);
                transform-origin: center center;
                transition: transform 0.4s ease-out;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
            ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38" fill="#1a56db">
                    <!-- Pointing UP (north) by default; CSS rotation handles direction -->
                    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                </svg>
            </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
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
    const tLat = Number(shipment?.takeoffLat) || 0;
    const tLng = Number(shipment?.takeoffLng) || 0;
    const dLat = Number(shipment?.deliveryLat) || 0;
    const dLng = Number(shipment?.deliveryLng) || 0;

    const [currentPos, setCurrentPos] = useState<[number, number]>([tLat, tLng]);

    useEffect(() => {
        const calculatePosition = () => {
            const start = new Date(shipment?.takeoffTime).getTime();
            const end = new Date(shipment?.deliveryTime).getTime();
            const now = Date.now();

            if (isNaN(start) || isNaN(end) || end <= start) {
                setCurrentPos([tLat, tLng]);
                return;
            }

            if (now <= start) {
                setCurrentPos([tLat, tLng]);
            } else if (now >= end) {
                setCurrentPos([dLat, dLng]);
            } else {
                const progress = Math.min(Math.max((now - start) / (end - start), 0), 1);
                const lat = tLat + (dLat - tLat) * progress;
                const lng = tLng + (dLng - tLng) * progress;
                setCurrentPos([lat, lng]);
            }
        };

        calculatePosition();
        const interval = setInterval(calculatePosition, 5000);
        return () => clearInterval(interval);
    }, [shipment?.takeoffLat, shipment?.takeoffLng, shipment?.deliveryLat, shipment?.deliveryLng, shipment?.takeoffTime, shipment?.deliveryTime, tLat, tLng, dLat, dLng]);

    const center = useMemo(() => currentPos, [currentPos]);

    // Always dynamically check takeoff (or current position) and destination so the plane is always facing the destination
    const bearing = useMemo(() => {
        const [cLat, cLng] = currentPos;
        const distToDest = Math.hypot(dLat - cLat, dLng - cLng);
        // If en route, point along vector towards destination; if arrived, preserve takeoff -> destination heading
        if (distToDest > 0.0001) {
            return getMapBearing(cLat, cLng, dLat, dLng);
        }
        return getMapBearing(tLat, tLng, dLat, dLng);
    }, [tLat, tLng, dLat, dLng, currentPos]);

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
                    [tLat, tLng],
                    [dLat, dLng],
                ]}
                color="#DAA520"
                dashArray="10, 10"
                weight={2}
            />
            <Marker position={[tLat, tLng]} icon={icon}>
                <Popup>Origin: {shipment?.takeoffLocation}</Popup>
            </Marker>
            <Marker position={[dLat, dLng]} icon={icon}>
                <Popup>Destination: {shipment?.deliveryLocation}</Popup>
            </Marker>
            <Marker position={currentPos} icon={planeIcon}>
                <Popup>Current Location (Estimated)</Popup>
            </Marker>
            <RecenterMap position={center} />
        </MapContainer>
    );
}
