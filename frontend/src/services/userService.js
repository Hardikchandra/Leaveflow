import axios from 'axios';

const API_URL = 'http://154.201.127.68:5001/api/users';

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/employees`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const createUser = async (name, email, role, createdBy) => {
  try {
    const response = await axios.post(`${API_URL}/create`, {
      name,
      email,
      role,
      createdBy
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
