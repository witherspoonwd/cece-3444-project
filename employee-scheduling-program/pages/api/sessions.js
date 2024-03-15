import { withSessionRoute } from "@/lib/config/withSession";
import { callDatabase } from "@/lib/backend/databaseCall";
import { useState } from 'react';
export default withSessionRoute(createSessionRoute);

async function createSessionRoute(req, res) {
    const query = 'SELECT ID, pwdHash, isSupervisor, firstName, lastName FROM employees';
    const result = await callDatabase(query);
    const ids = result.map(entry => entry.ID);
    const passwords = result.map(entry => entry.pwdHash);
    const roles = result.map(entry => entry.isSupervisor);
    const firstNames = result.map(entry => entry.firstName);
    const lastNames = result.map(entry => entry.lastName);

    
    if (req.method === "POST") {
        const { username, password, role } = req.body;
        const foundIndex = ids.findIndex(
            (dbUsername) => dbUsername.toString() === username
          );
        const updatedFirstName = firstNames[foundIndex];
        const updatedLastName = lastNames[foundIndex];
        const empName = `${updatedFirstName} ${updatedLastName}`;
        console.log("EMPNAME: ", empName);
        const convertedRole = roles[foundIndex] ? "Manager" : "Employee";
        if (username == ids[foundIndex] && password == passwords[foundIndex] && role === convertedRole) {
            req.session.user = {
                username: ids[foundIndex],
                role: role,
                empName: empName,
            };
            //console.log(req.session.user);
            await req.session.save();
           return res.send({ ok: true, user: req.session.user });
        }
        return res.status(403).send("");
    }
    return res.status(404).send("");
}