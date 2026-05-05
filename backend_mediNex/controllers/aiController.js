import OpenAI from "openai";
import Patient from "../models/patientModel.js";
import fs from "fs";

// Initialize OpenRouter API
const getOpenRouterModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });
};

/**
 * Task 1: Multilingual Symptom Checker
 * Route: POST /api/patient/ai/symptom-checker
 */
export const checkSymptoms = async (req, res) => {
  try {
    const { symptoms, location, budget } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ success: false, message: "Symptoms text is required" });
    }

    const openai = getOpenRouterModel();
    
    let userPrompt = `User Symptoms: ${symptoms}`;
    if (location) userPrompt += `\nUser Location: ${location}`;
    if (budget) userPrompt += `\nUser Budget: ${budget}`;

    const systemPrompt = `You are a medical AI assistant. The user will input symptoms in English, Bengali, or 'Banglish' (Bengali written in English letters). They may also provide an optional Location and Budget. Understand the problem, write a short, empathetic 2-line advice in the same language. If location or budget is provided, briefly acknowledge it (e.g. 'You can easily find a doctor near [location] within [budget]'). Return a STRICT JSON output containing: { "advice": "string", "recommended_specialization": "string" }. The specialization MUST exactly match one of these: [Cardiologist, General Physician, Dermatologist, Neurologist, Orthopedic, Pediatrician]. Do not wrap the JSON in Markdown formatting (no \`\`\`json). Just return the raw JSON object.`;
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    
    if (!response || !response.choices || !response.choices.length) {
      return res.status(500).json({ success: false, message: "Empty response from AI." });
    }
    
    const responseText = response.choices[0].message.content;
    
    // Parse the JSON strictly
    try {
      let jsonString = responseText;
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = responseText.substring(firstBrace, lastBrace + 1);
      } else {
        jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      
      const parsedOutput = JSON.parse(jsonString);
      return res.status(200).json({ success: true, result: parsedOutput });
    } catch (parseError) {
      console.error("AI Output Parsing Error:", responseText);
      return res.status(500).json({ success: false, message: "AI response format was invalid.", raw: responseText });
    }

  } catch (error) {
    console.error("Symptom Checker Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to analyze symptoms" });
  }
};

/**
 * Task 2: AI Prescription Analyzer
 * Route: POST /api/patient/ai/analyze-prescription
 * Middleware: multer upload
 */
export const analyzePrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No prescription image uploaded" });
    }

    const base64Image = Buffer.from(fs.readFileSync(req.file.path)).toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    const openai = getOpenRouterModel();
    const systemPrompt = `Analyze this doctor's prescription. Extract the medicines, how many days to take them, and the time of day. Return ONLY a JSON array: [{"medicineName": "string", "durationDays": number, "times": ["08:00", "14:00", "20:00"]}]. Infer logical times if morning/afternoon/night are mentioned (e.g., Morning = "08:00", Afternoon = "14:00", Night = "20:00"). Do not wrap the JSON in Markdown formatting (no \`\`\`json). Just return the raw JSON array.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    });
    
    if (!response || !response.choices || !response.choices.length) {
      return res.status(500).json({ success: false, message: "Empty response from AI." });
    }

    const responseText = response.choices[0].message.content;
    
    let parsedArray;
    try {
      let jsonString = responseText;
      const firstBracket = responseText.indexOf('[');
      const lastBracket = responseText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonString = responseText.substring(firstBracket, lastBracket + 1);
      } else {
        jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      }

      parsedArray = JSON.parse(jsonString);
      
      // Fallback: If AI returned an object with an array inside it e.g. { medicines: [...] }
      if (!Array.isArray(parsedArray)) {
        const values = Object.values(parsedArray);
        const arrayValue = values.find(val => Array.isArray(val));
        if (arrayValue) {
          parsedArray = arrayValue;
        } else {
          throw new Error("Parsed result does not contain an array");
        }
      }
    } catch (parseError) {
      console.error("Prescription AI Parsing Error:", responseText);
      // Clean up multer temp file if needed (Cloudinary might not have local file, wait...)
      // Ah! We are using Cloudinary for uploads!
      // Let's check how the file is stored.
      return res.status(500).json({ success: false, message: "AI response format was invalid." });
    }

    // Save this parsed array into the Patient's database schema under medication_alarms
    const patientId = req.user.id; // Provided by verifyToken middleware
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Add to medication alarms
    const newAlarms = parsedArray.map(item => ({
      medicineName: item.medicineName,
      durationDays: item.durationDays,
      times: item.times,
      addedAt: new Date()
    }));

    patient.medication_alarms.push(...newAlarms);
    await patient.save();

    return res.status(200).json({ 
      success: true, 
      message: "Prescription analyzed and alarms set successfully",
      alarms: newAlarms 
    });

  } catch (error) {
    console.error("Prescription Analyzer Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to analyze prescription" });
  }
};
