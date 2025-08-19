
import { useState, useEffect } from "react";

const useDB = () => {
  const [users, setUsers] = useState([]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await window.api.getUsers();
        setUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);


  const addUser = async (user) => {
    try {
      const newUser = await window.api.addUser(user);
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };


  const clearUsers = async () => {
    try {
      await window.api.clearUsers();
      setUsers([]);
    } catch (error) {
      console.error('Failed to clear users:', error);
    }
  };

  return { users, addUser, clearUsers };
};

export default useDB;
