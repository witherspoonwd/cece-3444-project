DROP TABLE IF EXISTS schedule_headers;
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS shift_change_requests;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS time_off_requests;

CREATE TABLE schedule_headers(
  ID INT NOT NULL AUTO_INCREMENT,
  isPublished boolean NULL,
  startDay DATE NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE schedule_items(
  ID INT NOT NULL AUTO_INCREMENT,
  empID INT NOT NULL,
  headerID INT,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE shift_change_requests(
  ID int NOT NULL AUTO_INCREMENT,
  traderEmpID INT NOT NULL,
  tradeeEmpID INT NOT NULL,
  shiftID INT NOT NULL,
  acceptedByTradee BOOLEAN DEFAULT NULL,
  approvedBySupervisor BOOLEAN DEFAULT NULL,
  PRIMARY KEY (ID)
);

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
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Fri', '00:00', '23:59');
INSERT INTO availability (empID, weekday, startTime, endTime) VALUES (10002, 'Sat', '00:00', '23:59');

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

INSERT INTO time_off_requests (empID, startTime, endTime, approvedBySupervisor) VALUES (10001, '2023-07-16 00:00', '2023-07-16 23:59', TRUE);
