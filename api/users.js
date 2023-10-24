const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcryptjs");

const { createUser, getAllUsers, getUserByUsername, client } = require("../db");

const jwt = require("jsonwebtoken");

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.send({
      users,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  const {
    rows: [user],
  } = await client.query(
    `
    SELECT *
    FROM users
    WHERE username=$1
  `,
    [username]
  );

  if (!user) {
    return res.status(400).json({ error: "user not found" });
  }


  try {
    const user = await getUserByUsername(username);

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      // res.send({
      //   message: "you're logged in!",
      //   token,
      // });
      res.status(200).redirect("/succes");
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
    `,
      [username]
    );

    if (user) {
      return res.status(400).json({ error: "username already exists" });
    }
    // if (_user) {
    //   next({
    //     name: "UserExistsError",
    //     message: "A user by that username already exists",
    //   });
    // }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await createUser({
      username,
      password: hashedPassword,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: userData.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    // res.send({
    //   message: "thank you for signing up",
    //   token,
    // });
    // res.status(200).json({ message: "sign up successfully" });
    res.status(200).redirect("/login");
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
