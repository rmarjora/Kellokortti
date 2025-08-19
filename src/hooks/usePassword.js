import bcrypt from "bcrypt"

const usePassword = () => {
  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };

  const getPasswordHash = async (person) => {
    try {
      const hash = await window.api.getPasswordHash(person);
      return hash;
    } catch (error) {
      console.error('Failed to get password hash:', error);
    }
  };

  const hasPassword = async (person) => {
    const hash = await getPasswordHash(person);
    return !!hash;
  };

  return { hashPassword, comparePassword, getPasswordHash, hasPassword };
};

export default usePassword;