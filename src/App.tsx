import ReportMap from './components/ReportMap';
import Heading from './components/Heading';
import List from './components/List';
import './App.css';
import { useEffect, useState } from 'react';

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

function App() {

  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [visibleIncidents, setVisibleIncidents] = useState<number[]>([]);
  

  // get incident list from storage
  useEffect(() => {
    const storedIncidents = localStorage.getItem('incidents');
    if (storedIncidents) {
      setIncidents(JSON.parse(storedIncidents));
    }
  }, []);

  // update the map when an incident is added
  function handleAddIncident(newIncident: Incident) {
    const updatedIncidents = [...incidents, newIncident];
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
  }

  // update map when an incident is deleted
  function handleDeleteIncident(index: number) {
    const updatedIncidents = incidents.filter((_, i) => i !== index);
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
  }

  

  return (
    <>
    <Heading/>
    <div className="container">
      <div className="box">
        <ReportMap setMarkerPosition={setMarkerPosition} incidents={incidents} setVisibleIncidents={setVisibleIncidents}/>
      </div>
      <div className="box">
        <List markerPosition={markerPosition} onAddIncident={handleAddIncident} onDeleteIncident={handleDeleteIncident} visibleIncidents={visibleIncidents}/>
      </div>
    </div>
    </>
  )
}

export default App
