"use client";

import { useEffect, useState } from "react";
import { useMapEvents, Marker, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

/** Fly to a position whenever it changes (used when editing existing coords) */
function FlyTo({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, Math.max(map.getZoom(), 5), { duration: 0.8 });
        }
    }, [position, map]);
    return null;
}

function LocationMarker({
    onSelect,
    initial,
}: {
    onSelect: (lat: number, lng: number) => void;
    initial: [number, number] | null;
}) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initial ? L.latLng(initial[0], initial[1]) : null
    );

    // If the parent passes a new initial value (e.g. while editing), sync it
    useEffect(() => {
        if (initial) setPosition(L.latLng(initial[0], initial[1]));
    }, [initial?.[0], initial?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : <Marker position={position} icon={icon} />;
}

export default function MapPicker({
    onSelect,
    initialLat,
    initialLng,
}: {
    onSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}) {
    // Only treat as a real position if both coords are non-zero
    const hasInitial = initialLat && initialLng && (initialLat !== 0 || initialLng !== 0);
    const initialPos: [number, number] | null = hasInitial ? [initialLat!, initialLng!] : null;

    return (
        <div className="h-52 w-full rounded-lg overflow-hidden border-2 border-gray-100 relative z-0">
            <MapContainer
                center={initialPos ?? [20, 0]}
                zoom={initialPos ? 5 : 2}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                />
                <LocationMarker onSelect={onSelect} initial={initialPos} />
                <FlyTo position={initialPos} />
            </MapContainer>
        </div>
    );
}
