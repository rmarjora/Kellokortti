import { useState } from 'react';
import ClickableName from "./ClickableName";
import Popup from "./Popup";
import PersonLogin from "./PersonLogin";
import Clocking from "./Clocking";

const NameList = ({ people }) => {

  if (people.length === 0) {
    return <div>No people yet...</div>;
  }

    const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showClocking, setShowClocking] = useState(false);

    const handleNameClick = (person) => {
      console.log('Clicked person:', person);
      setSelectedPerson(person);
      setShowPasswordPopup(true);
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
          />
        ))}
        <Popup open={showPasswordPopup} onClose={handleCancel}>
          {!showClocking ? (
            <PersonLogin person={selectedPerson} onSuccess={handleLoginSuccess} />
          ) : (
            <div>
              <h3>{selectedPerson?.name}</h3>
              <Clocking
                person={selectedPerson}
                onBreak={() => {/* TODO: implement break logic */}}
                onClockOut={() => {/* TODO: implement clock out logic */}}
              />
            </div>
          )}
        </Popup>
      </div>
    );
};

export default NameList;