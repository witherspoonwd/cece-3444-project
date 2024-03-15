// pages/api/updateProfile.js
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, phone, password, id } = req.body;

  try {
    const query = 'UPDATE employees SET email = ?, phoneNumber = ?, pwdHash = ? WHERE ID = ?';
    const values = [email, phone, password, id];
    await callDatabase(query, values);
    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}