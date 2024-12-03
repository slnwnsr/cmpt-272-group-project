import { useEffect, useState } from 'react';
import DetailsCard from './DetailsCard'
import CryptoJS from 'crypto-js';
import './List.css'

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

  // hashed password for verifying deletion and status changing
  const hashedPassword: string = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

function List({ markerPosition, onAddIncident, onDeleteIncident, onTriggerPopup, visibleIncidents = [] }:
    { markerPosition: [number, number] | null;
      onAddIncident: (incident: Incident) => void;
      onDeleteIncident: (index: number) => void;
      onTriggerPopup: (incident: Incident | null) => void 
      visibleIncidents?: number[];
    }) {

    // state for pulling up information when an incident in the list is selected
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    // load incidents into the list
    const [incidents, setIncidents] = useState<Incident[]>([]);
    useEffect(() => {
        const storedIncidents = localStorage.getItem('incidents');
        if (storedIncidents) {
          setIncidents(JSON.parse(storedIncidents));
        }
      }, []);

    // variables to hold lat and long from both text and map input
    const [useLongLatBool, setUseLongLatBool] = useState(false);
    var uselocationTextInput: number[] | null = null;

    // create and store the new incident
    async function addIncident(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        console.log("adding incident");
        console.log("checked bool: " + useLongLatBool);
        // get form values for creating a new incident
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const type = (document.getElementById('type') as HTMLInputElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const picture = (document.getElementById('picture') as HTMLInputElement).value || '';
        const comments = (document.getElementById('comments') as HTMLInputElement).value || '';
        const status = 'OPEN';
        // location will hold the correct lat long input (text or map)
        let location: [number, number] | null = [0, 0];

        const locationWarning = (document.getElementById("locationWarning") as HTMLInputElement);
        const locationTextInput = (document.getElementById("location") as HTMLInputElement).value;

        // determine if we are using text input or map input for lat long
        if (markerPosition && useLongLatBool) {
            // map marker input, set location to marker's lat long
            location[0] = markerPosition[0];
            location[1] = markerPosition[1];
            console.log(`Using map's marker: Latitude: ${location[0]}, Longitude: ${location[1]}`);
            locationWarning.style.visibility = "hidden";
        } else if (!useLongLatBool) {
            // text location input
            // first get lat and long from the text input
            uselocationTextInput = await geocodePlace(locationTextInput);
            if (uselocationTextInput) {
              // set location
              location[0] = uselocationTextInput[0];
              location[1] = uselocationTextInput[1];
              console.log(`Using location input: ${location[0]}, ${location[1]}`);
              locationWarning.style.visibility = "hidden";
            }
        } else {
              // handle invalid location (ie they checked the box but did not place a marker)
              console.log("Invalid location");
              locationWarning.style.visibility = "visible";
              location = null;
        }

        // now we have the location, can proceed with creating the incident
        if (location) {
            // get the place name from the coodinate
            const locationName: string | null = await reverseGeocode(location[0], location[1]);
            console.log("location name is " + locationName);
            // add the new incident to storage
            if (locationName) {
                // get date/time (may need to just be set to just a currentDateTime method for sorting)
                var dateTime: string = '';
                const currentDateTime = new Date();
                dateTime += currentDateTime.toLocaleDateString();
                dateTime += " (";
                dateTime += currentDateTime.getHours();
                dateTime += ":";
                if (currentDateTime.getMinutes() < 10) {
                    dateTime += "0";
                }
                dateTime += currentDateTime.getMinutes();
                dateTime += ")";
                // create new incident
                const newIncident: Incident = { name, type, phone, picture, location, locationName, comments, dateTime, status };
                const updatedIncidents = [...incidents, newIncident];
                // update states
                setIncidents(updatedIncidents);
                localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
                onAddIncident(newIncident);
                console.log("Incident saved:", newIncident);
                //reset input fields
                const form = event.target as HTMLFormElement;
                form.reset();
            }
        }
    }

    // delete an incident from the storage and update states
    function deleteIncident(index: number): void {
      // ask for password first
      let passwordInput = prompt('Password to delete incident');
      if ((passwordInput
          && hashedPassword != CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(passwordInput)).toString(CryptoJS.enc.Hex))
          || !passwordInput) {
          alert("Wrong password");
          return;
      }
      console.log("delete event with index " + index);
      const storedIncidents = JSON.parse(localStorage.getItem('incidents') || '[]') as Incident[];
      const updatedIncidents = storedIncidents.filter((_, i) => i !== index);
      localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
      setIncidents(updatedIncidents);
      onDeleteIncident(index);
  }

    // change incident's status
    function changeStatus(index: number): void {
      // ask for password
      let passwordInput = prompt('Password to change incident\'s status');
      if ((passwordInput
          && hashedPassword != CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(passwordInput)).toString(CryptoJS.enc.Hex))
          || !passwordInput) {
          alert("Wrong password");
          return;
      }
      console.log("changing status");
      const storedIncidents = JSON.parse(localStorage.getItem('incidents') || '[]') as Incident[];
      if (storedIncidents[index].status == "OPEN") {
          storedIncidents[index].status = "CLOSED";
      } else {
          storedIncidents[index].status = "OPEN";
      }
      localStorage.setItem('incidents', JSON.stringify(storedIncidents));
      setIncidents(storedIncidents);
    }

    // return lat and long values from location name text input
    async function geocodePlace(locationName: string) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          return [ parseFloat(lat), parseFloat(lon) ];
        } else {
          console.log("Location not found");
          return null;
        }
      }

      // get a city name from lat and long
      async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            console.log("location name: " + data.display_name);
            return data.address.city;
          } else {
            console.log("no name found for location");
            return null;
          }
        } catch (error) {
          console.error("reverseGeoCode error", error);
          return null;
        }
      }

      // disable/enable location text input depending on if user checks marker box
      function locationCheckbox(event: React.ChangeEvent<HTMLInputElement>) {
        setUseLongLatBool(event.target.checked);
        const locationTextInput = document.getElementById("location") as HTMLInputElement;
        locationTextInput.disabled = event.target.checked;
      }

      //Sort incidents by location name ascending
      function sortByLocationNameAscending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.locationName < b.locationName ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by location name descending
      function sortByLocationNameDescending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.locationName > b.locationName ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by type ascending
      function sortByTypeAscending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.type < b.type ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by type descending
      function sortByTypeDescending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.type > b.type ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by time ascending
      function sortByTimeAscending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.dateTime < b.dateTime ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by time descending
      function sortByTimeDescending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.dateTime > b.dateTime ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by status ascending
      function sortByStatusAscending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.status < b.status ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Sort incidents by status descending
      function sortByStatusDescending() {
        const incidentsArraySorted = [...incidents].sort((a,b) => a.status > b.status ? -1 : 1);
        setIncidents(incidentsArraySorted);
      }

      //Handle the event where the details section on list is clicked
      function prepPopup(incident: Incident) {
        setSelectedIncident(incident);
        onTriggerPopup(incident);
      }

      function closePopup() {
        setSelectedIncident(null);
        onTriggerPopup(null);
      }

    return(
        <>
        {/* FORM */}
        <div id="incidentWindow">
        <div id="incidentForm">
            <h3>Report an Incident</h3>
            <form onSubmit={addIncident}>
                <table>
                    <tbody>
                    <tr>
                        <td>Name:</td>
                        <td><input type="text" id="name" placeholder="First, Last" required></input></td>
                        <td>Emergency type:</td>
                        <td><input type="text" id="type" placeholder="e.g. Medical" required></input></td>
                    </tr>
                    <tr>
                        <td>Phone number:</td>
                        <td><input type="text" placeholder="XXX XXX XXXX" id="phone" required></input></td>
                        <td>Comments:</td>
                        <td><input type="text" id="comments"></input></td>
                    </tr>
                    <tr>
                        <td>Location:<br/><small>Place marker on map instead<input type="checkbox" id="useLatLong"
                            onChange={locationCheckbox}></input></small></td>
                        <td><input type="text" id="location" placeholder="e.g. Vancouver" required/><br/>
                        <small id="locationWarning">Please select a location</small>
                        </td>
                        <td>Picture URL <small>(optional)</small>:</td>
                        <td><input type="text" id="picture" ></input></td>
                    </tr>
                    </tbody>
                </table>
                <input type="submit" value="Submit" id="submitButton"></input>
            </form>
        </div>

      {/* INCIDENT LIST */}
        <div id="incidentList">
            <h3>Incident List</h3>
            <div id="tableContainer">
            <table id="listTable">
                <tbody>
                <tr>
                  <th>Location
                    <button onClick = {sortByLocationNameAscending}>↑</button>
                    <button onClick = {sortByLocationNameDescending}>↓</button>
                  </th>
                  <th>Type
                    <button onClick = {sortByTypeAscending}>↑</button>
                    <button onClick = {sortByTypeDescending}>↓</button> 
                  </th>
                  <th>Time Reported
                    <button onClick = {sortByTimeAscending}>↑</button>
                    <button onClick = {sortByTimeDescending}>↓</button> 
                  </th>
                  <th colSpan={3}>Status
                    <button onClick = {sortByStatusAscending}>↑</button>
                    <button onClick = {sortByStatusDescending}>↓</button> 
                  </th>
                </tr>
            {incidents.map((incident, index) => (
              <tr key={index} style={{display: visibleIncidents.includes(index) ? '' : 'none' }}>
                <td>{incident.locationName}</td>
                <td>{incident.type}</td>
                <td>{incident.dateTime}</td>
                <td className="status" onClick={() => changeStatus(index)}>{incident.status}</td>
                <td className="details" onClick={() => prepPopup(incident)}>Details</td>
                <td className="delete" onClick={ () => deleteIncident(index)}>Delete</td>
              </tr>
            ))}
            </tbody>
            </table>
            {/* DetailsCard displays the details of the selected incident */}
            {selectedIncident && (
                <DetailsCard
                    incident={selectedIncident}
                    onClose={() => closePopup()}
                />
            )}
            </div>
        </div>
        </div>
        </>
    );
}

export default List
