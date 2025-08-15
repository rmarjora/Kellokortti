import ClickableName from "./ClickableName";

const NameList = ({ people, addPerson }) => {

  if (people.length === 0) {
    return <div>No people yet...</div>;
  }

  return (
    <div className="name-list">
      {people.map((person) => (
        <ClickableName key={person.id} name={person.name} onClick={() => addPerson(person)} />
      ))}
    </div>
  );
};

export default NameList;