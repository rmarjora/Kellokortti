
import { useState, useEffect } from "react";

const useDB = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await window.api.getStudents();
        setStudents(students);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, []);


  const addStudent = async (student) => {
    try {
      const newUser = await window.api.addUser(student);
      setStudents(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const deleteStudent = async (userId) => {
    try {
      await window.api.deleteUser(userId);
      setStudents(prev => prev.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  }


  const clearStudents = async () => {
    try {
      await window.api.clearStudents();
      setStudents([]);
    } catch (error) {
      console.error('Failed to clear students:', error);
    }
  };

  return { students, addStudent, deleteStudent, clearStudents };
};

export default useDB;
