import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import projectService from "../services/project.services";
import { Project } from "../types/types";

export async function CreateProject(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // parse request body to extract project data
        const requestBody: any = await request.json();

        const project = {
            "name": requestBody.name,
            "description": requestBody.description
        }

        // Create the project using the projectService
        const createdProject = await projectService.create(project);

        const responseBody: Project = {
            "id": createdProject.id,
            "name": createdProject.name,
            "description": createdProject.description
        }

        return {
            status: 201,
            jsonBody: responseBody
        };

    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error creating project: ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to create project",
            }
        };
    }
};

app.http('CreateProject', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'projects',
    handler: CreateProject
});