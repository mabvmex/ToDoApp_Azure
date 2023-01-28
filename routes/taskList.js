// ESTE ES EL CONTROLADOR

const Task = require("../models/task");

class TaskList {
    /**
     * Maneja APIs y despliega y maneja los task
     * @param {Task} taskObjeto
     */
    constructor(taskObjeto) {
        this.taskObjeto = taskObjeto;
    }

    // CRUD - LEER TAREA
    async showTasks(req, res) {
        const querySpec = {
            query: "SELECT * FROM root c",
        };

        const items = await this.taskObjeto.find(querySpec);
        res.render("index", {
            title: "Todas las tareas",
            tasks: items,
        });
    }

    async showTasksCompleted(req, res) {
        const querySpec = {
            query: "SELECT * FROM root c WHERE c.completed=@completed",
            parameters: [
                {
                    name: "@completed",
                    value: true,
                },
            ],
        };

        const items = await this.taskObjeto.find(querySpec);
        res.render("realizado", {
            title: "Tareas realizadas",
            tasks: items,
        });
    }

    async showPendingTasks(req, res) {
        const querySpec = {
            query: "SELECT * FROM root c WHERE c.completed=@completed",
            parameters: [
                {
                    name: "@completed",
                    value: false,
                },
            ],
        };

        const items = await this.taskObjeto.find(querySpec);
        res.render("pendientes", {
            title: "Tareas pendientes",
            tasks: items,
        });
    }

    // CRUD - CREAR TAREA
    async addTask(req, res) {
        const item = req.body;

        await this.taskObjeto.addItem(item);
        res.redirect("/");
    }

    // CRUD - ACTUALIZAR TAREA
    async completeTask(req, res) {
        const completedTask = Object.keys(req.body);
        const tasks = [];

        completedTask.forEach((task) => {
            tasks.push(this.taskObjeto.updateItem(task));
        });

        await Promise.all(tasks);
        res.redirect("/");
    }

    // CRUD - ELIMINAR TAREA
    async deleteTask(req, res) {
        const completedTask = Object.keys(req.body);
        const tasks = [];

        completedTask.forEach((task) => {
            tasks.push(this.taskObjeto.deleteItem(task));
        });
        await Promise.all(tasks);
        res.redirect("/");
    }
}

module.exports = TaskList;
