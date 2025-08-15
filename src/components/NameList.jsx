import ClickableName from "./ClickableName";
import db from "../hooks/useDB";

const NameList = () => {
  const db = useDB();

  return (
    <div className="name-list">
      {db.people.map((person, index) => (
        <ClickableName key={index} name={person.name} onClick={() => db.addPerson(person)} />
      ))}
    </div>
  );
};

export default NameList;
