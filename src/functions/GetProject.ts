import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import projectService from "../services/project.services";
import { Project } from "../types/types";

export async function GetProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Read the projects using the projectService
        const getProject = await projectService.read(request.params.id);

        const responseBody: Project = {
            "id": getProject.id,
            "name": getProject.name,
            "description": getProject.description
        }

        return {
            status: 200,
            jsonBody: responseBody
        };

    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error reading project : ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to get projects",
            }
        };
    }
};

app.http('GetProject', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'projects/{id}',
    handler: GetProject
});