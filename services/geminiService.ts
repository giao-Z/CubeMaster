
import { GoogleGenAI, Type } from "@google/genai";
import { CubeState, CubeSize, SolveStep } from "../types";

const cubeStateToString = (state: CubeState): string => {
  let description = "Cube Configuration:\n";
  const faces = ['F', 'R', 'B', 'L', 'U', 'D'];
  faces.forEach(f => {
    // @ts-ignore
    const grid = state[f];
    description += `[Face ${f}]: ${grid.join(', ')}\n`;
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
  
  const systemInstruction = `
    You are an expert Rubik's Cube solver algorithm.
    The user has a ${size}x${size} Rubik's cube.
    
    GOAL: Provide a step-by-step solution to solve the cube from the given scrambled state.
    
    INPUT CONTEXT:
    The user has scanned the cube faces individually.
    Standard Unfolded Layout definitions:
    - F (Front): Row 0 touches U. Row Max touches D.
    - R (Right): Row 0 touches U. Row Max touches D.
    - B (Back): Row 0 touches U. Row Max touches D.
    - L (Left): Row 0 touches U. Row Max touches D.
    - U (Up): Row 0 is the BACK edge (touching B). Row Max is the FRONT edge (touching F).
    - D (Down): Row 0 is the FRONT edge (touching F). Row Max is the BACK edge (touching B).
    
    OUTPUT: A purely JSON array of steps.
    
    CRITICAL RULES:
    1. If the state looks IMPOSSIBLE (e.g. edge parity, twisted corner, missing color):
       - Do NOT return an error.
       - Instead, include a step describing how to PHYSICALLY fix it.
       - Example: {"move": "FIX", "description": "Flip the Front-Right edge piece physically."}
       - Then continue solving assuming it is fixed.
    2. Use Standard Notation: R, L, U, D, F, B (Clockwise) and R', L', U', etc. (Counter-Clockwise). Use R2, U2 for 180 turns.
    3. For 4x4/5x5, use wide moves like Rw, Uw if necessary.
    4. Keep descriptions very short (max 5 words).
    5. Do not include markdown code blocks. Just the JSON.
  `;

  const prompt = `
    Cube Size: ${size}x${size}
    
    Scrambled State:
    ${stateDescription}

    Solve it now. Return purely JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              move: { type: Type.STRING, description: "Notation e.g. R, U', F2, FIX" },
              description: { type: Type.STRING, description: "Short explanation" }
            },
            required: ["move", "description"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    const steps = JSON.parse(jsonText) as SolveStep[];
    
    if (!Array.isArray(steps) || steps.length === 0) {
       throw new Error("Invalid solution format");
    }

    return steps;

  } catch (error) {
    console.error("Gemini Solve Error:", error);
    // Return a fallback step so the app doesn't crash, but encourages rescan
    return [
      { move: "ERROR", description: "AI Calculation Failed. Please rescan." }
    ];
  }
};
