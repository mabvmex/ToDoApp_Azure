const Task = require("../models/task");

// ESTE ES EL CONTROLADOR

class TaskList {
    /**
     * Maneja APIs y despliega y maneja los task
     * @param {Task} taskObjeto
     */
    constructor(taskObjeto) {
        this.taskObjeto = taskObjeto;
    }

    async showTasks(req, res) {
        const querySpec = {
            query: "SELECT * FROM root r WHERE r.completed=@completed",
            // query: "SELECT * FROM c",
            parameter: {
                name: "@completed",
                value: false,
            },
        };

        const items = await this.taskObjeto.find(querySpec);
        res.render("index", {
            title: "Mi lista de pendientes",
            task: items,
        });
    }

    async addTask(req, res) {
        const item = req.body;

        await this.taskObjeto.addTask(item);
        res.redirect("/");
    }

    async completeTask(req, res) {
        const completedTask = Object.keys(req.body);
        const tasks = [];

        completedTask.forEach((task) => {
            tasks.push(this.taskObjeto.updateItem(task));
        });

        await Promise.all(tasks);
        res.redirect("/");
    }
}

module.exports = TaskList;
