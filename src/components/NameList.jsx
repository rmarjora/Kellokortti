import { useEffect, useState, useCallback } from 'react';
import ClickableName from "./ClickableName";
import Popup from "./Popup";
import PersonLogin from "./PersonLogin";
import Clocking from "./Clocking";
import Options from './Options';

const NameList = ({ people, supervised }) => {
  if (people.length === 0) {
    return <div>No people yet...</div>;
  }

  const [arrivals, setArrivals] = useState([]);

  const refetchArrivals = useCallback(async () => {
    const todays = await window.api.getTodaysArrivals();
    console.log("Today's arrivals:", todays);
    setArrivals(todays);
  }, []);

  useEffect(() => {
    refetchArrivals();
  }, []);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showClocking, setShowClocking] = useState(false);

    const handleNameClick = (person) => {
      console.log('Clicked person:', person);
      setSelectedPerson(person);
      supervised ? setShowClocking(true) : setShowPasswordPopup(true);
    };

    const handleCancel = () => {
      setShowPasswordPopup(false);
      setShowClocking(false);
      setSelectedPerson(null);
    };

    const handleLoginSuccess = (person) => {
      // Switch to Clocking view within the same Popup
      setShowClocking(true);
    };

  return (
      <div className="name-list">
        {people.map((person) => (
          <ClickableName
            key={person.id}
            name={person.name}
            onClick={() => handleNameClick(person)}
            hasArrived={arrivals.some(arrival => arrival.userId === person.id)}
          />
        ))}
        <Popup open={showPasswordPopup} onClose={handleCancel} exitText='Takaisin'>
          <PersonLogin person={selectedPerson} onSuccess={handleLoginSuccess} />
        </Popup>
        <Popup open={showClocking} onClose={handleCancel} exitText= {supervised ? 'Takaisin' : 'Kirjaudu ulos'}>
          <h3>{selectedPerson?.name}</h3>
          <Clocking
            person={selectedPerson}
            onClocked={refetchArrivals}
            supervised={supervised}
          />
          <Options user={selectedPerson} />
        </Popup>
      </div>
    );
};

export default NameList;