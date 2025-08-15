import { useState, useEffect } from "react";

const useDB = () => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    setPeople(window.api.invoke("getPeople"));
  }, []);

  const addPerson = (person) => {
    window.api.invoke("addPerson", person);
  };

  return { people, addPerson };
};

export default useDB;
