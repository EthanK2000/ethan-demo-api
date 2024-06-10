import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import projectService from "../services/project.services";
import { Projects } from "../types/types";

export async function GetProjects(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Read the projects using the projectService
        const getProjects = await projectService.readAll();

        // Map database results to output
        const responseBody: Projects = getProjects.map(project => ({
            "id": project.id,
            "name": project.name,
            "description": project.description
        }))

        return {
            status: 200,
            jsonBody: {
                "Projects": responseBody
            }
        };

    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error reading projects: ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to get projects",
            }
        };
    }
};

app.http('GetProjects', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'projects',
    handler: GetProjects
});