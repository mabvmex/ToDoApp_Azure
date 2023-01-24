const CosmosClient = require("@azure/cosmos").CosmosClient;
const debug = require("debug")("todo-mongo:task");

let partitionKey = undefined;

// MODELO DE DATOS;

class Task {
    /**
     * Lee, agrega y actualiza tareas en CosmosDB
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
            "id": "this.databaseID",
        });

        this.database = dbResponse.database;

        debug("Inicializando contenedor...");
        const contenedorResponse =
            await this.database.containers.createIfNotExists({
               "id": "this.containerID",
            });

        this.container = contenedorResponse.container;
    }

    /**
     * Encuentra un objeto en la DB
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
     * Crea el item enviado en CosmosDB
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

    /**
     * Se actualiza el Item en la DB
     * @param {string} itemID
     * @returns
     */
    async updateItem(itemID) {
        debug("actualizando Item");

        const doc = await this.getItem(itemID);
        doc.completed = true;

        const { resource: replaced } = await this.container
            .item(itemID, partitionKey)
            .replace(doc);

        return replaced;
    }

    /**
     * Busca un Item en l DB
     * @param {string} itemID
     * @returns
     */
    async getItem(itemID) {
        debug("Buscando Item en la DB");

        const { resource } = await this.container.item(itemID, partitionKey);

        return resource;
    }
}

module.exports = Task;
