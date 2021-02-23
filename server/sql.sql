
drop table if exists secure_items;
drop table if exists devices;
drop table if exists users;
create table users(
   id INT NOT NULL AUTO_INCREMENT,
   username VARCHAR(100) NOT NULL,
   password VARCHAR(60) NOT NULL,
   UNIQUE KEY(username),
   PRIMARY KEY ( id )
);

create table devices(
   id INT NOT NULL AUTO_INCREMENT,
   public_id VARCHAR(100) NOT NULL,
   secret VARCHAR(60) NOT NULL,
   description JSON NOT NULL,
   user_id INT NOT NULL,
   session_token VARCHAR(96) DEFAULT NULL,
   token_expiration DATETIME NULL DEFAULT NULL,
   FOREIGN KEY(user_id) REFERENCES users(id),
   UNIQUE KEY(public_id),
   PRIMARY KEY ( id )
);

create table secure_items (
   id INT NOT NULL AUTO_INCREMENT,
   public_id VARCHAR(100) NOT NULL,
   item JSON NOT NULL,
   owning_user_id INT NOT NULL,
   FOREIGN KEY(owning_user_id) REFERENCES users(id),
   UNIQUE KEY(public_id),
   PRIMARY KEY ( id )
)