
import { useState, useEffect } from "react";

const useDB = () => {
  const [people, setPeople] = useState([]);


  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const persons = await window.api.getPersons();
        setPeople(persons);
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      }
    };
    fetchPersons();
  }, []);


  const addPerson = async (person) => {
    try {
      const newPerson = await window.api.addPerson(person);
      setPeople(prev => [...prev, newPerson]);
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  };


  const clearPersons = async () => {
    try {
      await window.api.clearPersons();
      setPeople([]);
    } catch (error) {
      console.error('Failed to clear persons:', error);
    }
  };

  return { people, addPerson, clearPersons };
};

export default useDB;
