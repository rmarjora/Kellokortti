import useDB from './hooks/useDB';
import NameList from './components/NameList';

function App() {
  const { people, addPerson, clearPersons } = useDB();

  return (
    <div style={{ padding: '2rem' }}>
  <h1>Users</h1>
  <button onClick={() => addPerson({ name: 'Alice' })}>Add Person</button>
  <NameList people={people} addPerson={addPerson} />
  <button onClick={clearPersons}>Clear persons</button>
    </div>
  );
}

export default App;
