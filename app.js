const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const TaskList = require("./routes/TaskList");
const Task = require("./models/task");

const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

// MOSTRAS LOS VIEWS DE JADE COMO HTML CON EXPRESS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const cosmosClient = new CosmosClient({
    endpoint: config.host,
    key: config.authKey,
});

const taskObjeto = new Task(
    cosmosClient,
    config.databaseID,
    config.containerID
);

const taskList = new TaskList(taskObjeto);

taskObjeto
    .init((err) => {
        console.log(err);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

app.get("/", (req, res, next) => {
    taskList.showTasks(req, res).catch(next);
});

app.post("/agregar", (req, res, next) => {
    taskList.addTask(req, res).catch(next);
});

app.get("/pendientes", (req, res, next) => {
    taskList.showPendingTasks(req, res).catch(next);
});

app.post("/realizar", (req, res, next) => {
    taskList.completeTask(req, res).catch(next);
});

app.get("/realizado", (req, res, next) => {
    taskList.showTasksCompleted(req, res).catch(next);
});

app.post("/eliminar", (req, res, next) => {
    taskList.deleteTask(req, res).catch(next);
});

app.set("view engine", "jade");

// MANEJAR UN 404
app.use(function (req, res, next) {
    const err = new Error(
        "Algo salió mal (AQUÍ VA MEME DE UN PERRITO) >>> Error Not Found"
    );
    err.status = 404;
    next(err);
});

module.exports = app;
