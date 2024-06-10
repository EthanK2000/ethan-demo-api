import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import projectService from "../services/project.services";

export async function DeleteProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Extract project id and tenantId from the request
        const id: string = request.params.id;

        // Delete the project using the projectService
        const deletedProduct = await projectService.delete(id);

        return {
            status: 200,
            jsonBody: {
                deletedProduct
            },
        };
        
    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error deleting project: ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to delete project",
            },
        };
    }
};

app.http('DeleteProject', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'projects/{id}',
    handler: DeleteProject
});