import { GoogleGenAI, Type } from "@google/genai";
import { CubeState, CubeSize, SolveStep } from "../types";

const cubeStateToString = (state: CubeState): string => {
  let description = "Cube State (Faces F, R, B, L, U, D | Reading order: Top-Left to Bottom-Right row by row):\n";
  Object.entries(state).forEach(([face, colors]) => {
    description += `Face ${face}: ${colors.join(', ')}\n`;
  });
  return description;
};

export const getSolveSteps = async (cubeState: CubeState, size: CubeSize): Promise<SolveStep[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const stateDescription = cubeStateToString(cubeState);
  
  // Dynamic instruction based on size
  let algoPreference = "";
  if (size === 2) algoPreference = "Use Ortega or CLL methods.";
  else if (size === 3) algoPreference = "Use CFOP or Layer-by-Layer.";
  else algoPreference = "Use Reduction method (reduce centers, then edges, then 3x3 stage). Mention parity algorithms if needed.";

  const systemInstruction = `
    You are an expert Rubik's Cube solver algorithm.
    The user has a ${size}x${size} Rubik's cube.
    ${algoPreference}
    I will provide the color state of the 6 faces.
    Calculate the solution steps.
    Use standard Singmaster notation (e.g., R, U, F, Rw for wide moves on 4x4+).
    For each step, provide a VERY short explanation (max 8 words).
    If impossible state, return one step with move="ERROR" and description="Invalid State".
  `;

  const prompt = `
    Cube Size: ${size}x${size}
    Current Scrambled State:
    ${stateDescription}

    Return a JSON array of steps to solve it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              move: { type: Type.STRING, description: "Notation e.g. R, U', F2, 2R" },
              description: { type: Type.STRING, description: "Short explanation" }
            },
            required: ["move", "description"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText) as SolveStep[];

  } catch (error) {
    console.error("Gemini Solve Error:", error);
    return [
      { move: "Error", description: "AI Service Unreachable" }
    ];
  }
};
