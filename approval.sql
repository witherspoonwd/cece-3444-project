USE ESPdb;

DROP TABLE IF EXISTS shift_change_requests;
DROP TABLE IF EXISTS time_off_requests;

CREATE TABLE shift_change_requests(
  ID int NOT NULL AUTO_INCREMENT,
  traderEmpID int NOT NULL,
  tradeeEmpID int NOT NULL,
  shiftID int NOT NULL,
  acceptedByTradee BOOLEAN DEFAULT NULL,
  approvedBySupervisor BOOLEAN DEFAULT NULL,
  PRIMARY KEY (ID)
);

INSERT INTO shift_change_requests (traderEmpID, tradeeEmpID, shiftID, acceptedByTradee) VALUES (10001, 10002, 1, FALSE);
INSERT INTO shift_change_requests (traderEmpID, tradeeEmpID, shiftID, acceptedByTradee) VALUES (10001, 10002, 2, FALSE);


CREATE TABLE time_off_requests(
	ID int NOT NULL AUTO_INCREMENT,
    empID INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    approvedBySupervisor BOOLEAN DEFAULT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO time_off_requests (empID, startTime, endTime) values (10001, "2023-06-26 19:00", "2023-06-26 22:00");
INSERT INTO time_off_requests (empID, startTime, endTime) values (10002, "2023-06-26 19:00", "2023-06-26 22:00");
