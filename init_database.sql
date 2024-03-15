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
  PRIMARY KEY (ID)
);

ALTER TABLE employees AUTO_INCREMENT=10001;

INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor) VALUES ("Gorgamesh", "Smith", "gorg@gorg.site", "154-158-1242", "sndfjknvljksd3uj8937y489278mkesaniasjdg@@@", FALSE);
INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor) VALUES ("Michael", "Protsch", "yoitsmike@gmail.com", "587-950-1111", "sndfjknvljksd3u8937y489278mkesaniasjdg@@@", FALSE);
INSERT INTO employees (firstName, lastName, email, phoneNumber, pwdHash, isSupervisor) VALUES ("Sarah", "Parker", "sparker@nsa.gov", "214-817-7854", "a", TRUE);


CREATE TABLE example (
	id int NOT NULL auto_increment,
    name varchar(25) NOT NULL,
    username varchar(25) NOT NULL,
    password varchar(25) NOT NULL,
    PRIMARY KEY (id)
);


INSERT INTO example (name, username, password) VALUES ("harold", "a", "z");
INSERT INTO example (name, username, password) VALUES ("charlie", "b", "y");
INSERT INTO example (name, username, password) VALUES ("michael", "c", "x");
INSERT INTO example (name, username, password) VALUES ("dennis", "d", "w");
INSERT INTO example (name, username, password) VALUES ("molly", "e", "v");