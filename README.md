# Test task
## How to start project
Connection object to database in /db/db.js
```sh
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DB",
  password: "root",
  port: 5432
})
```

Create table Users
```sh
CREATE TABLE Users(
  uid uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email CHARACTER VARYING(100) NOT NULL UNIQUE,
  password CHARACTER VARYING(100) NOT NULL UNIQUE,
  nickname CHARACTER VARYING(30) NOT NULL UNIQUE
);
```

Create Table Tag
```sh
CREATE TABLE Tag(
  id SERIAL PRIMARY KEY,
  creator uuid,
  name CHARACTER VARYING(40),
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (creator) REFERENCES Users(uid)
);
```

Install dependencies and start project on port 1337

```sh
npm install
node app.js
```
