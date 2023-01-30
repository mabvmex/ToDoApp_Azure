// MODELO DE DATOS - CLASE;

const CosmosClient = require("@azure/cosmos").CosmosClient;
const debug = require("debug")("todo-cosmos:task");

/*  */
let partitionKey = 0;
// let partitionKey = undefined;

class Task {
    /**
     * LEE, AGREGA Y ACTUALIZA TAREAS EN COSMOSDB
     * @param {CosmosClient} cosmosClient
     * @param {string} databaseID
     * @param {string} containerID
     */
    constructor(cosmosClient, databaseID, containerID) {
        this.client = cosmosClient;
        this.databaseID = databaseID;
        this.containerID = containerID;

        this.database = null;
        this.container = null;
    }

    async init() {
        debug("Inicializando DB");
        const dbResponse = await this.client.databases.createIfNotExists({
            id: this.databaseID,
        });

        this.database = dbResponse.database;

        debug("Inicializando contenedor...");
        const contenedorResponse =
            await this.database.containers.createIfNotExists({
                id: this.containerID,
            });

        this.container = contenedorResponse.container;
    }

    /**
     * ENCUENTRA UN OBJETO EN LA DB
     * @param {string} querySpec
     */
    async find(querySpec) {
        debug("Buscando en la DB");

        if (!this.container) {
            throw new Error("El contenedor no se ha inicializado");
        }

        const { resources } = await this.container.items
            .query(querySpec)
            .fetchAll();

        return resources;
    }

    /**
     * CREA EL ITEM ENVIADO EN COSMOSDB
     * @param {*} item
     * @returns {resource} Item creado en la DB
     */
    async addItem(item) {
        debug("Agregando Item a la DB");

        item.date = Date.now();
        item.completed = false;
        const { resource: doc } = await this.container.items.create(item);
        return doc;
    }

    // /**
    //  * BUSCA UN ITEM EN LA DB
    //  * @param {string} itemId
    //  * @returns
    //  */
    // async getItem(itemId) {
    //     debug("Buscando Item en la DB");

    //     const { resource: doc } = await this.container.item(itemId).read();
    //     return doc;
    // }

    /**
     * ACTUALIZA EL ESTADO DE UN ITEM EN LA DB
     * completado / pendiente
     * @param {string} itemId
     * @returns
     */
    async updateItem(itemId) {
        debug("Actualizando Item");

        const { resource: doc } = await this.container.item(itemId).read();

        if (!doc.completed) {
            doc.completed = true;
        } else {
            doc.completed = false;
        }

        const { resource: replaced } = await this.container
            .item(itemId)
            .replace(doc);

        return replaced;
    }

    /**
     * ELIMINA UN ITEM DE LA DB
     * @param {string} itemId
     * @returns {replaced};
     */
    async deleteItem(itemId) {
        debug("Eliminando Item");
        const { resource: replaced } = await this.container
            .item(itemId)
            .delete();
        return replaced;
    }
}

module.exports = Task;
