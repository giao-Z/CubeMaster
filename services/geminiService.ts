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
  else if (size === 3) algoPreference = "Use a Layer-by-Layer or CFOP approach (Cross, F2L, OLL, PLL).";
  else algoPreference = "Use Reduction method (reduce centers, then edges, then 3x3 stage). Mention parity algorithms if needed.";

  const systemInstruction = `
    You are an expert Rubik's Cube solver algorithm.
    The user has a ${size}x${size} Rubik's cube.
    ${algoPreference}
    
    INPUT: The color state of the 6 faces.
    TASK: Calculate the step-by-step solution.
    
    CRITICAL OUTPUT RULES:
    1. Use standard Singmaster notation: R, L, U, D, F, B (Clockwise) and R', L', U', etc. (Counter-clockwise), and R2, U2 (180 degrees).
    2. For N>3, use standard wide move notation if needed (e.g., Rw, 2R).
    3. Verify the state validity. If impossible (e.g., 5 centers of one color), return 1 step with move="ERROR" and description="Invalid State".
    4. Provide a SHORT description for each step (e.g., "White Cross", "Insert Edge", "OLL Parity").
    5. Return ONLY valid JSON.
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