/**
 * GridSense AI - Dynamic AI Tutor Engine
 */

export class MicrogridAICoach {
  constructor(apiKey = "") {
    this.apiKey = apiKey;
    // Updated to stable production model endpoint
    this.modelName = "gemini-1.5-flash"; 
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : "";
  }

  /**
   * Generates dynamic microgrid operator guidance using Gemini AI.
   * @param {Object} telemetry - Current simulation state parameters
   */
  async generateOperatorGuidance(telemetry) {
    if (!this.apiKey) {
      return "Gemini API key missing. Please enter a valid Gemini API key to activate real-time AI microgrid coaching.";
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const systemPrompt = `You are GridSense AI, an expert Microgrid Energy Management System (EMS) and Productive Use of Energy (PUE) Assistant. 
Analyze the provided microgrid real-time telemetry and give concise (2-3 sentences), highly actionable advice for a rural community microgrid operator.
Focus on grid stability, battery health, and load balancing between essential services (Rural Clinic) and agricultural productive loads (Agri-Mill/EV).`;

    const userPrompt = `
CURRENT TELEMETRY:
- Solar PV Generation: ${telemetry.solarKW} kW
- Essential Load (Clinic/Pumps): ${telemetry.essentialKW} kW
- Secondary Load (Agri-Mill/EV): ${telemetry.secondaryActive ? telemetry.secondaryKW + ' kW (ACTIVE)' : 'DISCONNECTED'}
- Total Demand: ${telemetry.totalDemandKW} kW
- Power Delta (ΔP): ${telemetry.deltaPKW} kW
- Battery State of Charge (SoC): ${telemetry.soc.toFixed(1)}%
- Auto-Shed Trigger Active: ${telemetry.autoShed ? 'YES' : 'NO'}

Provide concise, expert operational recommendations.`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt + "\n\n" + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 150
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return aiText ? aiText.trim() : "Unable to parse AI response. Check network connectivity.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return `Gemini AI Error: ${error.message}`;
    }
  }
}