DROP DATABASE IF EXISTS ESPdb;

CREATE DATABASE ESPdb; 
USE ESPdb;

CREATE TABLE employees(
  ID int NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(24) NOT NULL,
  lastName VARCHAR(24) NOT NULL,
  email VARCHAR(24) NOT NULL,
  phoneNumber VARCHAR(12) NOT NULL,
  pwdHash VARCHAR(255) NOT NULL,
  isSupervisor BOOLEAN NOT NULL,
  isEmployeeOfTheWeek BOOLEAN NOT NULL,
  profilePic VARCHAR(255) NOT NULL,
  PRIMARY KEY (ID)
);

ALTER TABLE employees AUTO_INCREMENT=10001;

INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor, isEmployeeOfTheWeek, profilePic) VALUES ("Gorgamesh", "Smith", "gorg@gorg.site", "154-158-1242", "sndfjknvljksd3uj8937y489278mkesaniasjdg@@@", FALSE, FALSE, "gorgameshsmith.png");
INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor, isEmployeeOfTheWeek, profilePic) VALUES ("Michael", "Protsch", "yoitsmike@gmail.com", "587-950-1111", "sndfjknvljksd3u8937y489278mkesaniasjdg@@@", FALSE, FALSE, "michaelprotsch.png");
INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor, isEmployeeOfTheWeek, profilePic) VALUES ("Sarah", "Parker", "sparker@nsa.gov", "214-817-7854", "a", TRUE, TRUE, "sarahgarza.png");

CREATE TABLE availability(
  ID INT NOT NULL AUTO_INCREMENT,
  empID INT NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  weekday VARCHAR(3) NOT NULL,
  PRIMARY KEY (ID)
);

INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Sun', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Mon', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Tue', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Wed', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Thu', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Fri', '12:00', '22:00');
/* INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Sat', '00:00', '23:59'); */

INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Sun', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Mon', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Tue', '16:00', '20:00');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Wed', '08:00', '17:30');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Thu', '13:00', '23:00');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Fri', '12:00', '18:00');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10003, 'Sat', '00:00', '23:59');

INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Sun', '17:00', '20:00');
/* INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Mon', '08:00', '12:00'); */
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Tue', '12:00', '16:30');
/* INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Wed', '08:00', '17:00'); */
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Thu', '08:00', '13:30');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Fri', '14:30', '18:00');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10001, 'Sat', '18:00', '23:59');

CREATE TABLE time_off_requests(
  ID INT NOT NULL AUTO_INCREMENT,
  empID INT NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  approvedBySupervisor BOOLEAN DEFAULT NULL,
  PRIMARY KEY (ID)
);

INSERT INTO time_off_requests (empID, startTime, endTime, approvedBySupervisor) VALUES (10002, '2023-07-16 00:00', '2023-07-16 23:59', NULL);
