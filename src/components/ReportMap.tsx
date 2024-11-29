import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import './ReportMap.css';
import "leaflet/dist/leaflet.css";
import { useState } from 'react';

interface Incident {
  name: string;
  type: string;
  phone: string;
  picture?: string;
  location: [number, number];
  locationName: string;
  comments?: string;
  dateTime: string;
  status: string;
}

function ReportMap({ setMarkerPosition, incidents }:
    {setMarkerPosition: (position: [number, number]) => void,
    incidents: Incident[];}) {

  const [position, setPosition] = useState<[number, number] | null>(null);

  // place a temporary marker where the client clicks on the map
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setMarkerPosition([lat, lng]);
      },
    });
    return position ? (
      <Marker position={position} opacity={.6}/>
    ) : null;
  }

  return (
    <>
      <MapContainer center={[49.251868, -122.948341]} zoom={12}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident, index) => (
          <Marker key={index} position={incident.location}>
            <Popup>
              {/* display preview of details when marker is clicked */}
              <strong>{incident.type}</strong> <br/>
              {incident.comments} <br />
              {incident.picture && (
                <img
                  src={incident.picture}
                  alt={incident.name}
                  style={{ width: '100px', height: 'auto' }}
                />
              )}
            </Popup>
          </Marker>
        ))}
        <LocationMarker />
      </MapContainer>
    </>
  );
}

export default ReportMap
