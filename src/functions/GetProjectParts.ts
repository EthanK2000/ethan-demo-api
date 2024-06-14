import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import projectService from "../services/project.services";
import { Project } from "../types/types";
import OpenAI from "openai";

function cleanJsonString(jsonString) {
  if (!jsonString.startsWith('```json')) {
    return jsonString; // Return the original string if it doesn't start with "```json";
  }

  jsonString = jsonString.trim();
  const pattern = /^```json\s*(.*?)\s*```$/s;
  const cleanedString = jsonString.replace(pattern, '$1');
  return cleanedString.trim();
}

export async function GetProjectParts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Read the projects using the projectService
    var getProject = await projectService.read(request.params.id);

    const openai = new OpenAI();

    var completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You will be provided with a hardware engineering project's title and description. Return a list of just the high level components to develop the project. Provide your output in json format as an array of strings."
        },
        {
          role: "user",
          content: "Title: " + getProject.name + "\n\nDescription: " + getProject.description
        }
      ],
      model: "gpt-3.5-turbo",
    });

    const partsGPT = completion.choices[0].message.content;
    const parts = JSON.parse(cleanJsonString(partsGPT));

    var partsDetails = [];
    var optionDetails;
    var options;

    for (var i in parts) {
        completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You will be provided with a hardware engineering project's title and description as well as the high level component to develop the project. Add a list of possible parts for the high level components as well as pros and cons for the part. Provide your output in json format as an array of {\"name\":\"part\",\"pros\":[\"pro 1\",\"pro 2\"],\"cons\":[\"con 1\",\"con 2\"]}."
              },
              {
                role: "user",
                content: "Title: " + getProject.name + "\n\nDescription: " + getProject.description + "\n\High level component: " + parts[i]
              }
            ],
            model: "gpt-3.5-turbo",
          });

          optionDetails = completion.choices[0].message.content;
          options = JSON.parse(cleanJsonString(optionDetails));

          partsDetails.push({
            "name": parts[i],
            "options": options
          });
     };

     getProject.parts = partsDetails;

    // Update the project using the projectService
    const updatedProject = await projectService.update(getProject.id, getProject);

    const responseBody = {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      parts: updatedProject.parts
    };

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
      },
    };
  }
}

app.http("GetProjectParts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{id}/parts",
  handler: GetProjectParts,
});
