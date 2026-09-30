import { GoogleGenAI } from "@google/genai";

// Vercel serverless function for Graphite AI Assistant
// Replaces the Express /api/chat endpoint from server.ts
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // req.body is undefined (or a raw string) when the request has no JSON content type
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { message, lang = "id" } = body;
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isEn = lang === "en";

  // System instruction for the Graphite AI assistant
  const systemInstruction = isEn
    ? `You are "Graphite", an empathetic, supportive, and clinical-professional AI Health Assistant for "Grahita Space" — a companion platform for the Grahita Band biometric wearable (monitoring heart rate BPM, heart rate variability HRV, and cognitive stress levels).
Your job is to provide calming, scientific, and actionable advice to students dealing with stress, study fatigue, or anxiety.
GUIDELINES:
1. Always respond in English.
2. Keep your answers relatively short, conversational, structured, and easy to read (use clear bullet points or short paragraphs).
3. Always include this disclaimer as a separate paragraph at the very bottom of your response: "Disclaimer: I am an AI assistant and not a replacement for a licensed psychologist, psychiatrist, or school counselor (Guru BK). If you are experiencing severe distress, please contact a professional or visit the Guru BK room."
4. If the student shares high stress biometrics (e.g., BPM > 100, HRV < 35, Overload status), guide them gently through a 4-7-8 breathing exercise (inhale for 4s, hold for 7s, exhale for 8s) or tell them to stretch.`
    : `Anda adalah "Graphite", Asisten Kesehatan AI yang empatis, suportif, dan profesional-klinis untuk "Grahita Space" — platform pendamping untuk perangkat wearable biometrik Grahita Band (yang memantau detak jantung BPM, variabilitas detak jantung HRV, dan tingkat stres kognitif).
Tugas Anda adalah memberikan saran yang menenangkan, ilmiah, dan praktis kepada siswa yang menghadapi stres, kelelahan belajar, atau kecemasan.
PANDUAN:
1. Selalu jawab dalam Bahasa Indonesia yang ramah namun profesional.
2. Jaga agar jawaban Anda relatif singkat, santai, terstruktur, dan mudah dibaca (gunakan poin-poin yang jelas atau paragraf pendek).
3. Selalu sertakan penafian (disclaimer) ini sebagai paragraf terpisah di bagian paling bawah jawaban Anda: "Disclaimer: Saya adalah asisten AI dan bukan pengganti psikolog, psikiater, atau Guru BK berlisensi. Jika Anda mengalami tekanan berat, silakan hubungi profesional atau kunjungi ruang Guru BK."
4. Jika siswa membagikan data biometrik stres tinggi (misalnya, BPM > 100, HRV < 35, status Overload), bimbing mereka dengan lembut melalui latihan pernapasan 4-7-8 (tarik napas 4 detik, tahan 7 detik, buang napas 8 detik) atau ingatkan untuk meregangkan tubuh.`;

  // Fallback response when API key is missing
  if (!apiKey) {
    const fallbackText = isEn
      ? "Hello! I am Graphite, your companion. (Gemini API key is not configured). Make sure to breathe deeply! Let's do a 4-7-8 breathing session.\n\nDisclaimer: I am an AI assistant and not a replacement for a licensed psychologist, psychiatrist, or school counselor (Guru BK). If you are experiencing severe distress, please contact a professional or visit the Guru BK room."
      : "Halo! Saya Graphite, pendamping setiamu. (Kunci API Gemini belum dikonfigurasi). Pastikan untuk bernapas dalam-dalam! Mari lakukan sesi pernapasan 4-7-8.\n\nDisclaimer: Saya adalah asisten AI dan bukan pengganti psikolog, psikiater, atau Guru BK berlisensi. Jika Anda mengalami tekanan berat, silakan hubungi profesional atau kunjungi ruang Guru BK.";
    return res.json({ response: fallbackText, reply: fallbackText });
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    // Format conversation history for Gemini API
    const contents = history.map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || (isEn
      ? "I'm here to support you. Let's take a deep breath."
      : "Saya di sini untuk mendukungmu. Mari tarik napas dalam-dalam.");

    return res.json({ response: reply, reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errText = isEn
      ? "I experienced a minor glitch, but remember: breathing deeply (4-7-8 rule) is a scientifically proven way to calm your nervous system.\n\nDisclaimer: I am an AI assistant and not a replacement for a licensed psychologist, psychiatrist, or school counselor (Guru BK)."
      : "Saya mengalami sedikit gangguan teknis. Ingat: bernapas dalam-dalam (aturan 4-7-8) adalah cara yang terbukti untuk menenangkan sistem saraf Anda.\n\nDisclaimer: Saya adalah asisten AI dan bukan pengganti psikolog, psikiater, atau Guru BK berlisensi.";
    return res.status(500).json({ response: errText, reply: errText });
  }
}
