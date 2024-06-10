import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import projectService from "../services/project.services";
import { Project } from "../types/types";

export async function UpdateProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Parse request body to extract project data
        const requestBody: any = await request.json();

        const project = {
            "id": request.params.id,
            "name": requestBody.name,
            "description": requestBody.description
        }

        // Update the project using the projectService
        const updatedProject = await projectService.update(project.id, project);

        const responseBody: Project = {
            "id": updatedProject.id,
            "name": updatedProject.name,
            "description": updatedProject.description
        }

        return {
            status: 200,
            jsonBody: {
                updatedProject
            }
        };

    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error updating project: ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to update project",
            }
        };
    }
};

app.http('UpdateProject', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'projects/{id}',
    handler: UpdateProject
});