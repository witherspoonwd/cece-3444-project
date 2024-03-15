import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { shiftId } = req.body;
  console.log("Shift ID:", shiftId);
  try {
    const query = 'UPDATE shift_change_requests SET acceptedByTradee = 1 WHERE shiftID = ?';
    const values = [shiftId];
    await callDatabase(query, values);
    return res.status(200).json({ message: 'SCR updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}