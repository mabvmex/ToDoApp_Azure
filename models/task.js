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

        console.log(doc); // Muestra Objeto creado completo
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
    //     console.log("Esto es RESOURCE: ", { doc }); // Regresa el objeto completo
    //     return doc;
    // }

    /**
     * ACTUALIZA EL ITEM EN LA DB
     * @param {string} itemId
     * @returns
     */
    async updateItem(itemId) {
        debug("Actualizando Item");
        console.log("Esto es el ITEMID: " + itemId); // Regresa el Id de la tarea

        const { resource: doc } = await this.container.item(itemId).read();
        console.log("============");
        console.log("Esto es DOC: ", "==>", doc.name); // Regresa el objeto completo
        console.log("Esto es DOC: ", "==>", doc.id); // Regresa el objeto completo
        console.log("Esto es DOC: ", "==>", doc.completed); // Regresa el objeto completo
        
        if (!doc.completed) {
            doc.completed = true;
        } else {
            doc.completed = false;
        }
        console.log("Esto es DOC: ", "==>", doc.name); // Regresa el objeto completo
        console.log("Esto es DOC después del click: ", "==>", doc.id); // Regresa el objeto completo
        console.log("Esto es DOC después del click: ", "==>", doc.completed); // Regresa el objeto completo
        console.log("============");

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
