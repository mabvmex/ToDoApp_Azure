const CosmosClient = require("@azure/cosmos").CosmosClient;
const debug = require("debug")("todo-cosmos:task");

let partitionKey = undefined; //0;

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

        console.log(doc);

        return doc;
    }

    /**
     * Busca un Item en l DB
     * @param {string} itemId
     * @returns
     */
    async getItem(itemId) {
        debug("Buscando Item en la DB");

        // const { resource } = await this.container.item(itemId, partitionKey);
        const { resource } = await this.container.item(itemId).read();

        console.log("Esto es RESOURCE: " + resource);
        return resource;
    }

    /**
     * Se actualiza el Item en la DB
     * @param {string} itemId
     * @returns
     */
    async updateItem(itemId) {
        debug("Actualizando Item");

        console.log("Lo que llega en ITEMID es: " + itemId);

        const doc = await this.getItem(itemId);
        console.log("Esto es DOC: " + doc); // undefined

        if (!doc.completed) {
            doc.completed = true;
        } else {
            doc.completed = false;
        }

        const { resource: replaced } = await this.container
            // .item(itemId, partitionKey)
            .item(itemId)
            .replace(doc);

        return replaced;
    }

    /**
     * 
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
