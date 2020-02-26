//Import boilerplate
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
// Sequelize imports
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "postgres://postgres:secret@localhost:5432/postgres"
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// User model
const User = sequelize.define("user", {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});
//Task model
const Task = sequelize.define("task", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

sequelize
  .sync()
  .then(() => console.log("Tables created successfully"))
  .catch(err => {
    console.error("Unable to create tables, shutting down...", err);
    process.exit(1);
  });

// app.use(bodyParser.json()); This is defined middleware

// app.post('/echo', (req, res) => {
//   res.json(req.body)
// })
//Creates a new user
app.post("/users", (req, res, next) => {
  User.create(req.body)
    .then(user => res.json(user))
    .catch(err => next(err));
});
// Gets user information
app.get("/users/:userId", (req, res, next) => {
  User.findByPk(req.params.userId).then(user => {
    if (!user) {
      res.status(404).end();
    } else {
      res.json(user);
    }
  });
});
// Updates user information
app.put("/users/:userId", (req, res) => {
  User.findByPk(req.params.userId).then(user => {
    if (user) {
      user.update(req).then(user => res.json(user));
    } else {
      res.status(404).end();
    }
  });
});

app.delete("/users/:userId", (req, res) => {
  console.log("HI!!", req.params.userId);
  User.destroy({
    where: {
      id: req.params.userId
    }
  }).then(numOfRecordsDeleted => {
    console.log("deleted?", numOfRecordsDeleted);
    if (numOfRecordsDeleted === 1) {
      res.status(200).send("User deleted");
    } else {
      res.status(404).send("User does not exist");
    }
  });
});
// Get all tasks
app.get("/users/:userId/tasks/:taskId", (req, res) => {
  Task.findOne({
    where: {
      id: req.params.taskId,
      userId: req.params.userId
    }
  }).then(task => {
    if (task) {
      return res.json(task);
    } else {
      res.status(404).end();
    }
  });
});
// Get all user's tasks
app.get("/users/:userId/tasks", (req, res, next) => {
  Task.findAll({
    where: {
      userId: req.params.userId
    }
  })
    .then(tasks => res.json(tasks))
    .catch(next);
});

// Update an existing task
app.put("/users/:userId/tasks/:taskId", (req, res, next) => {
  Task.findOne({
    where: {
      id: req.params.taskId,
      userId: req.params.userId
    }
  }).then(task => {
    if (task) {
      task.update(req.body).then(task => res.json(task));
    } else {
      task.status(404).end();
    }
  });
});
// Delete a user's task
app.delete("/users/:userId/tasks/:taskId", (req, res, next) => {
  Task.destroy({
    where: {
      id: req.params.taskId,
      userId: req.params.userId
    }
  }).then(task => {
    if (task) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  });
});
// Delete all user's tasks
app.delete("/users/:userId/tasks", (req, res, next) => {
  Task.destroy({
    where: {
      userId: req.params.userId
    }
  }).then(() => {
    res.status(204).end();
  });
});
app.get("/", (req, res) => res.send("Hello"));

// Create a new task

app.post("/users/:userId/tasks", async (req, res, next) => {
  User.findByPk(req.params.userId)
    .then(user => {
      if (!user) {
        res.status(404).end();
      } else {
        Task.create({
          ...req.body,
          userId: req.params.userId
        }).then(task => {
          res.json(task);
        });
      }
    })
    .catch(next);
});

app.listen(port, () => console.log("Listening on port ", port));
