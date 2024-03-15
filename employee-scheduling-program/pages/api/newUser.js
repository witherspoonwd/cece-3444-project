// pages/api/updateProfile.js
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { firstName, lastName, email, phone, password, isSupervisor } = req.body;
  const isSupervisorValue = isSupervisor === 'TRUE' ? 1 : 0;
  try {
    const query = 'INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [firstName, lastName, email, phone, password, isSupervisorValue, "sarahgarza.png"];
    await callDatabase(query, values);
    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}