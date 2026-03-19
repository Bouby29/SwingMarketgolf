import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase as base44 } from "@/lib/supabase";

// Cache la clé publique pour éviter de la re-fetcher
let _cachedPublicKey = null;

// Charge Leaflet dynamiquement depuis CDN pour éviter les conflits React
function useLeaflet(mapRef, points, selectedPoint, onMarkerClick) {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current).setView([46.603354, 1.888334], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {};
  }, []);

  // Mettre à jour les marqueurs quand les points changent
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (points.length === 0) return;

    const greenIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });

    const validPoints = points.filter(p => p.latitude && p.longitude);
    const bounds = [];

    validPoints.forEach(point => {
      const isSelected = selectedPoint?.id === point.id;
      const marker = L.marker(
        [parseFloat(point.latitude), parseFloat(point.longitude)],
        { icon: isSelected ? redIcon : greenIcon }
      ).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="font-size:13px;min-width:160px">
          <b>${point.name}</b><br>
          <span style="color:#666">${point.street} ${point.house_number}<br>${point.postal_code} ${point.city}</span><br>
          <button onclick="window.__selectRelayPoint('${point.id}')" style="margin-top:6px;background:#1B5E20;color:white;border:none;border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px">
            Choisir ce point
          </button>
        </div>
      `);
      markersRef.current.push(marker);
      bounds.push([parseFloat(point.latitude), parseFloat(point.longitude)]);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [points, selectedPoint]);

  return mapInstanceRef;
}

export default function SendcloudRelayPicker({ carrierId, onSelect, onClose }) {
  const [searchPostal, setSearchPostal] = useState("");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const mapRef = useRef(null);
  const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const mapInstance = useLeaflet(mapRef, points, selectedPoint, setSelectedPoint);

  // Expose la sélection depuis le popup Leaflet
  useEffect(() => {
    window.__selectRelayPoint = (id) => {
      const point = points.find(p => String(p.id) === String(id));
      if (point) onSelect(point);
    };
    return () => { delete window.__selectRelayPoint; };
  }, [points, onSelect]);

  const fetchPoints = async (postal) => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Récupérer la clé publique depuis le backend (avec cache)
      if (!_cachedPublicKey) {
        const keyRes = await base44.functions.invoke("getSendcloudPublicKey", {});
        _cachedPublicKey = keyRes.data?.public_key;
      }
      if (!_cachedPublicKey) throw new Error("Clé publique introuvable");

      const sendcloudCarrier = carrierId || "mondial_relay";
      const params = new URLSearchParams({
        country: "FR",
        postal_code: postal,
        language: "fr_FR",
        results: "20",
        radius: "10000",
        carriers: sendcloudCarrier,
      });

      const response = await fetch(
        `https://servicepoints.sendcloud.sc/api/v2/service-points/?${params.toString()}`,
        { headers: { "Authorization": `Basic ${btoa(`${_cachedPublicKey}:`)}` } }
      );

      if (!response.ok) throw new Error(`API error ${response.status}`);
      const data = await response.json();
      setPoints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Service points error:", err);
      setPoints([]);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchPostal.trim()) fetchPoints(searchPostal.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 md:p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1B5E20]" />
            <h2 className="font-bold text-gray-900 text-lg">Choisir un point relais</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 py-3 border-b border-gray-100 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={searchPostal}
            onChange={(e) => setSearchPostal(e.target.value)}
            placeholder="Entrez votre code postal (ex: 75001, 69001...)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] placeholder-gray-400"
          />
          <Button type="submit" disabled={loading} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-lg px-4 text-sm h-auto py-2 gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Chercher
          </Button>
        </form>

        {/* Map + List */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "400px" }} />
            {!hasSearched && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000] pointer-events-none">
                <div className="text-center">
                  <MapPin className="w-10 h-10 text-[#1B5E20] mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-gray-500 font-medium">Entrez un code postal pour voir les points relais</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[1000]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1B5E20]" />
              </div>
            )}
          </div>

          {/* List */}
          <div className="w-80 flex-shrink-0 border-l border-gray-100 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!loading && !hasSearched && (
                <div className="text-center py-8 text-gray-400 text-sm">Lancez une recherche pour voir les points relais.</div>
              )}
              {!loading && hasSearched && points.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">Aucun point relais trouvé.</div>
              )}
              {!loading && points.map((point) => (
                <div
                  key={point.id}
                  onClick={() => setSelectedPoint(point)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${
                    selectedPoint?.id === point.id
                      ? "border-[#1B5E20] bg-green-50"
                      : "border-gray-200 hover:border-[#1B5E20] hover:bg-green-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedPoint?.id === point.id ? "text-[#1B5E20]" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs leading-tight">{point.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{point.street} {point.house_number}</p>
                      <p className="text-xs text-gray-500">{point.postal_code} {point.city}</p>
                      {point.opening_hours?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {point.opening_hours.slice(0, 3).map((h, i) => (
                            <div key={i} className="flex gap-1 text-xs text-gray-400">
                              <span className="font-medium w-7">{weekdays[h.day] ?? `J${h.day}`}</span>
                              <span>{h.open?.replace(":00", "h")} – {h.close?.replace(":00", "h")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPoint && (
              <div className="p-3 border-t border-gray-100 flex-shrink-0">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                  <p className="text-xs font-semibold text-gray-900 truncate">{selectedPoint.name}</p>
                  <p className="text-xs text-gray-500">{selectedPoint.postal_code} {selectedPoint.city}</p>
                </div>
                <Button onClick={() => onSelect(selectedPoint)} className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full text-sm">
                  Confirmer ce point relais
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}