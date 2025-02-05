import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Icône personnalisée pour les parkings
const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2838/2838912.png",
  iconSize: [30, 30],
});

type Parking = {
  id: number;
  lat: number;
  lon: number;
  name: string;
  capacity: string;
  type: string;
  fee: string;
  access: string;
};

const App: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);

  useEffect(() => {
    const fetchParkingData = async () => {
      const bbox = "48.8300,2.2900,48.8800,2.4000"; // Zone de Paris (modifiable)
      const query = `[out:json];node["amenity"="parking"](${bbox});out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      try {
        const response = await axios.get(url);
        console.log("✅ Données brutes de l'API :", response.data); // 🔍 Voir la structure

        if (!response.data.elements) {
          console.error("❌ Format inattendu des données API :", response.data);
          return;
        }

        // Transformation des données pour ajouter les infos utiles
        const data = response.data.elements
          .filter((p: any) => p.lat && p.lon) // ✅ Vérifie que `lat` et `lon` existent
          .map((p: any) => {
            console.log("🔍 Parking brut :", p); // Vérifie si `fee` et `access` sont disponibles

            return {
              id: p.id,
              lat: p.lat,
              lon: p.lon,
              name: p.tags?.name || "Parking inconnu",
              capacity: p.tags?.capacity || "Inconnu",
              type: p.tags?.parking || "Non spécifié",
              fee: p.tags?.fee === "yes" ? "Payant" : p.tags?.fee === "no" ? "Gratuit" : "Inconnu",
              access: p.tags?.access || "Public",
            };
          });

        console.log("✅ Parkings transformés avec détails :", data);
        setParkings(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des parkings :", error);
      }
    };

    fetchParkingData();
  }, []);

  console.log("📍 Parkings à afficher sur la carte :", parkings); // ✅ Vérification avant affichage

  return (
    <div style={{ height: "100vh", width: "100vw" }}> {/* Ajout d'un conteneur global */}
      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marqueurs dynamiques des parkings */}
        {parkings.length > 0 ? (
          parkings.map((parking) => (
            <Marker key={parking.id} position={[parking.lat, parking.lon]} icon={parkingIcon}>
              <Popup>
                <b>📍 {parking.name}</b> <br />
                🏢 Type : {parking.type} <br />
                🚗 Capacité : {parking.capacity} places <br />
                💰 Tarif : {parking.fee} <br />
                🔑 Accès : {parking.access}
              </Popup>
            </Marker>
          ))
        ) : (
          <p style={{ color: "red", fontSize: "18px", textAlign: "center" }}>
            ❌ Aucun parking trouvé.
          </p>
        )}

        {/* Test : Ajoute un marqueur fixe pour voir si Leaflet fonctionne */}
        <Marker position={[48.8566, 2.3522]} icon={parkingIcon}>
          <Popup>🛠️ Marqueur test (Paris)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;
