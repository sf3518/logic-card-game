CREATE TABLE drp_users (
  uid SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  email_verified BOOLEAN,
  password_hash VARCHAR(64) NOT NULL,
  date_created DATE,
  last_login DATE
);

CREATE TABLE drp_posts (
  pid SERIAL PRIMARY KEY,
  title VARCHAR(255),
  body VARCHAR,
  user_id INT REFERENCES users(uid),
  author VARCHAR REFERENCES users(username),
  date_created TIMESTAMP,
  like_user_id INT[] DEFAULT ARRAY[]::INT[],
  likes INT DEFAULT 0
);

CREATE TABLE drp_comments (
  cid SERIAL PRIMARY KEY,
  comment VARCHAR(255),
  author VARCHAR REFERENCES users(username),
  user_id INT REFERENCES users(uid),
  post_id INT REFERENCES posts(pid),
  date_created TIMESTAMP
);

CREATE TABLE drp_levels (
  lid SERIAL PRIMARY KEY,
  level_id INT,
  author VARCHAR(255) REFERENCES drp_users(username) 
  user_id INT REFERENCES drp_users(uid),
  json_in_string VARCHAR,
  created_date DATE,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0, 

);