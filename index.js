// Minimal Express API for Railway
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// CORS: open for testing; later restrict to your domain
app.use(cors({ origin: "*", methods: ["POST", "OPTIONS"] }));

// Optional simple auth (uncomment to protect your API):
// app.use((req, res, next) => {
//   const token = process.env.PUBLIC_TOKEN;
//   if (!token) return next();
//   const auth = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
//   if (auth !== token) return res.status(401).json({ error: "unauthorized" });
//   next();
// });

app.post("/api/chi/report", async (req, res) => {
  const { brand } = req.body || {};
  if (!brand) return res.status(400).json({ error: "brand required" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 👇 Paste your FULL system brief here (the 9 sections, rules, scoring tables).
    const system = `
You are an expert brand strategist tasked with analyzing a brand's cultural relevance using comprehensive real-time web research.

## ANALYSIS FRAMEWORK

### 1. CULTURAL RELEVANCE SCORING (0-100)
Evaluate across these dimensions:
- **Music & Entertainment** (0-20): Collaborations, mentions, cultural moments
- **Fashion & Style** (0-20): Trendsetting, influencer adoption, runway presence  
- **Sports & Lifestyle** (0-20): Athlete partnerships, event presence, community impact
- **Social Media Buzz** (0-20): Engagement rates, viral moments, conversation volume
- **Innovation & Authenticity** (0-20): Product innovation, brand authenticity, cultural leadership

### 2. MOMENTUM ANALYSIS
Track recent changes in:
- Search volume trends (last 30 days)
- Social media engagement shifts
- News coverage sentiment
- Celebrity/influencer associations

### 3. COMPETITIVE LANDSCAPE
Compare against 2-3 direct competitors on overall cultural score and key differentiators.

### 4. CONFIDENCE LEVELS
- **High**: Multiple recent data points, clear trends
- **Medium**: Some data available, moderate confidence in assessment  
- **Low**: Limited data, uncertain trends

### 5. RESEARCH REQUIREMENTS
- Use current, real-time information when possible
- Cite specific examples and sources
- Focus on cultural impact, not just business metrics
- Consider generational and demographic differences

### 6. SCORING GUIDELINES
- 90-100: Cultural icon, defining trends
- 70-89: Strong cultural presence, influential
- 50-69: Moderate cultural relevance
- 30-49: Limited cultural impact
- 0-29: Minimal cultural presence

Provide comprehensive analysis with specific examples, recent developments, and clear reasoning for all scores.
    `.trim();

    const user = `Brand: ${brand}
Return only JSON with these fields (used by the UI):
{
  "brand": string,
  "logo": string | null,
  "overallScore": number | null,
  "confidence": string,
  "summary": string,
  "momentum": [{"label": string, "delta": string}],
  "sources": [{"url": string}],
  "competitive": [{"brand": string, "overall": number | null, "summary": string | null}]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-thinking",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    // Try to parse JSON (fallback to first {...} block if needed)
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const m = text.match(/{[\s\S]*}/);
      data = m ? JSON.parse(m[0]) : {};
    }

    // Compute momentum average for the card UI
    const momentumAvg = Array.isArray(data.momentum)
      ? Math.round(
          (data.momentum.reduce((acc, m) => {
            const s = String(m?.delta || "").toLowerCase();
            if (s.includes("flat")) return acc;
            const mm = s.match(/([+\-]?\d+(?:\.\d+)?)/);
            return acc + (mm ? parseFloat(mm[1]) : 0);
          }, 0) / Math.max(1, data.momentum.length)) * 10
        ) / 10
      : 0;

    const payload = {
      brand: data.brand || brand,
      logo: data.logo || "",
      overallScore: Number.isFinite(Number(data.overallScore)) ? Number(data.overallScore) : null,
      momentumAvg,
      confidence: data.confidence || "Medium",
      summary: data.summary || "",
      sources: Array.isArray(data.sources) ? data.sources : [],
      competitive: Array.isArray(data.competitive) ? data.competitive : []
    };

    res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upstream_error", detail: String(err?.message || err) });
  }
});

app.get("/", (_, res) => res.send("Culture Heat Index API running"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
