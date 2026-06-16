import { Context } from "hono"

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ""

const SYSTEM_PROMPT = `Kamu adalah AI classifier untuk platform pengaduan masyarakat Indonesia bernama LaporAja.

Dari judul dan deskripsi laporan, tentukan KATEGORI dan PRIORITAS.

KATEGORI (pilih SATU): Infrastruktur, Lingkungan, Kebersihan, Keamanan, Fasilitas Umum, Lainnya
PRIORITAS: High, Medium, Low

RESPONS dalam format JSON SAJA, tanpa markdown:
{"category":"...","priority":"...","confidence":0.0}`

export const categorizeReport = async (c: Context) => {
    try {
        const { title, description } = await c.req.json()

        if (!title && !description) {
            return c.json(
                { success: false, message: "Title atau description diperlukan" },
                400
            )
        }

        const res = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.2-3b-preview",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: `Judul: ${title ?? ""}\nDeskripsi: ${description ?? ""}`,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 100,
                }),
            }
        )

        const data = await res.json()
        const content = data.choices?.[0]?.message?.content ?? ""
        const jsonMatch = content.match(/\{[\s\S]*?\}/)

        if (!jsonMatch) {
            return c.json({
                success: true,
                data: { category: "Lainnya", priority: "Medium", confidence: 0 },
            })
        }

        const parsed = JSON.parse(jsonMatch[0])
        const VALID = [
            "Infrastruktur", "Lingkungan", "Kebersihan",
            "Keamanan", "Fasilitas Umum", "Lainnya",
        ]

        return c.json({
            success: true,
            data: {
                category: VALID.includes(parsed.category) ? parsed.category : "Lainnya",
                priority: ["Low", "Medium", "High"].includes(parsed.priority)
                    ? parsed.priority
                    : "Medium",
                confidence:
                    typeof parsed.confidence === "number"
                        ? Math.min(Math.max(parsed.confidence, 0), 1)
                        : 0.5,
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json({ success: false, message }, 500)
    }
}