import ClickableName from "./ClickableName";
import useDB from "../hooks/useDB";

const NameList = () => {
  const { people, addPerson, clearPersons } = useDB();

  return (
    <div className="name-list">
      {people.map((person, index) => (
        <ClickableName key={index} name={person.name} onClick={() => addPerson(person)} />
      ))}
      {/* Optionally, add a button to clear all persons */}
      {/* <button onClick={clearPersons}>Clear All</button> */}
    </div>
  );
};

export default NameList;