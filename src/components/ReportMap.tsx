import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import './ReportMap.css';
import "leaflet/dist/leaflet.css";
import { useState } from 'react';
import { LeafletEvent } from 'leaflet'; // Import LeafletEvent type
import DetailsCard from './DetailsCard'

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

// interface MapProps {
//   setMarkerPosition: (position: [number, number]) => void;
//   incidents: Incident[];
//   setVisibleIncidents: (indices: number[]) => void;
// }

function ReportMap({ setMarkerPosition, incidents, triggerIncident, setVisibleIncidents }:
    {setMarkerPosition: (position: [number, number]) => void,
    incidents: Incident[];
    triggerIncident: Incident | null;
    setVisibleIncidents: (indices: number[]) => void;
    }) {

  const [position, setPosition] = useState<[number, number] | null>(null);
  // state for pulling up information when an incident in the list is selected
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // place a temporary marker where the client clicks on the map
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setMarkerPosition([lat, lng]);
      },
      moveend(e: LeafletEvent) { // Type the event here as LeafletEvent
        const map = e.target; // Access the map object
        const bounds = map.getBounds(); // Get the updated bounds
        
        // Track which incident indices are visible
        const visibleIndices = incidents.reduce((acc: number[], incident, index) => {
          const markerLatLng = { lat: incident.location[0], lng: incident.location[1] };
          if (bounds.contains(markerLatLng)) {
            acc.push(index);
          }
          return acc;
        }, []);

        setVisibleIncidents(visibleIndices);
      },
    });
    return position ? (
      <Marker position={position} opacity={.6} />
    ) : null;
  }

  function Details() {
    return (
      <>
        {/* DetailsCard displays the details of the selected incident */}
        {selectedIncident && (
          <DetailsCard
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <MapContainer center={[49.251868, -122.948341]} zoom={12}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident, index) => (
          <Marker 
            key={index} 
            position={incident.location}
            eventHandlers={{
              click: () => setSelectedIncident(incident),
            }}
          >
            <Popup>
              {/* display preview of details when marker is clicked */}
              <strong>{incident.type}</strong> <br />
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
        <Details />
        {/* Trigger popup when the details button in List is clicked*/}
        {triggerIncident && ( 
            <Popup position={triggerIncident?.location}>
              <strong>{triggerIncident.type}</strong> <br/>
              {triggerIncident.comments} <br />
              {triggerIncident.picture && (
                <img
                  src={triggerIncident.picture}
                  alt={triggerIncident.name}
                  style={{ width: '100px', height: 'auto' }}
                />
              )}
            </Popup>
        )}
      </MapContainer>
        {/* DetailsCard displays the details of the selected incident */}
      {selectedIncident && (
        <DetailsCard
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
        />
      )}
    </>
  );
}

export default ReportMap;