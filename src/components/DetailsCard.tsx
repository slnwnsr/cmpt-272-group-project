import './DetailsCard.css'

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

function DetailsCard({ incident, onClose }: { incident: Incident; onClose: () => void }) {
return (
  <div className="cardBehind">
    <div className="card">
      { /* list incident's full information in the card*/ }
      <strong>Type:</strong> {incident.type}<br/>
      <strong>Reported by:</strong> {incident.name}<br/>
      <strong>Location:</strong> {incident.locationName}<br/>
      <strong>Comments:</strong> {incident.comments || "None"}<br/>
      <strong>Phone:</strong> {incident.phone}<br/>
      <strong>Time:</strong> {incident.dateTime}<br/>
      <strong>Status:</strong> {incident.status}<br/>
      {incident.picture && <img src={incident.picture} alt={incident.name} width="300"/>}<br/>
      <button className="closeButton" onClick={onClose}>Close</button>
      </div>
  </div>
);
}

export default DetailsCard
