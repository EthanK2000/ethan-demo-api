import { CosmosClient } from "@azure/cosmos";

// Set connection string from CONNECTION_STRING value in local.settings.json
const CONNECTION_STRING = process.env.COSMOSDB_PROJECTS;
const tenantId = "1";

const projectService = {
  init() {
    try {
      this.client = new CosmosClient(CONNECTION_STRING);
      this.database = this.client.database("ProjectsDb");
      this.container = this.database.container("ProjectsContainer");
    } catch (err) {
      console.log(err.message);
    }
  },
  async create(project) {
    project.TenantId = tenantId;
    const { resource } = await this.container.items.create(project);
    return resource;
  },
  async readAll() {
    const iterator = this.container.items.query({
      query: "SELECT * FROM c WHERE c.TenantId = @tenantId",
        parameters: [
            {
                name: "@tenantId",
                value: tenantId
            }
        ]
    });
    const { resources } = await iterator.fetchAll();
    return resources;
  },
  async read(id: string) {
    const { resource } = await this.container.item(id, tenantId).read();
    return resource;
  },
  async update(id: string, project) {
    project.TenantId = tenantId;
    const { resource } = await this.container.item(id, tenantId).replace(project);
    return resource;
  },
  async delete(id: string) {
    const result = await this.container.item(id, tenantId).delete();
    return;
  },
};

projectService.init();

export default projectService;
