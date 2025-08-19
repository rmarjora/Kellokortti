import { useState } from 'react';
import ClickableName from "./ClickableName";
import Popup from "./Popup";
import PersonLogin from "./PersonLogin";

const NameList = ({ people }) => {

  if (people.length === 0) {
    return <div>No people yet...</div>;
  }

    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);

    const handleNameClick = (person) => {
      console.log('Clicked person:', person);
      setSelectedPerson(person);
      setShowPasswordPopup(true);
    };

    const handleCancel = () => {
      setShowPasswordPopup(false);
      setSelectedPerson(null);
    };

    const handleSubmit = (password, person) => {
      // TODO: validate password or send to backend as needed
      // For now, just close the popup.
      setShowPasswordPopup(false);
      setSelectedPerson(null);
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
        <Popup open={showPasswordPopup} onClose={() => { setShowPasswordPopup(false); setSelectedPerson(null); }}>
          <PersonLogin person={selectedPerson} />
        </Popup>
      </div>
    );
};

export default NameList;