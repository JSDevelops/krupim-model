import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, guardApi } from '../../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../../_lib/ai'

const FALLBACK_TURNS = [
  {
    reply: "Good evening! Thank you. Yes, I have a reservation for two under the name Smith. Is our table ready?",
    translationTh: "สวัสดีตอนเย็นครับ! ขอบคุณครับ ใช่ครับ ผมมีจองโต๊ะสำหรับ 2 ท่านไว้ในชื่อ สมิธ โต๊ะพร้อมแล้วหรือยังครับ?",
    stage: "Greeting & Seating",
    suggestedResponses: [
      "Certainly, Mr. Smith! Your table is ready. Right this way, please.",
      "Yes, Mr. Smith! Please follow me to your table by the window. Here are your menus."
    ],
    isFinished: false
  },
  {
    reply: "Thank you! Could we have some sparkling water with lemon to start? And what do you recommend for the main course?",
    translationTh: "ขอบคุณครับ! ขอเริ่มด้วยน้ำแร่สปาร์กลิงใส่มะนาวได้ไหมครับ? แล้วคุณแนะนำอาหารจานหลักอะไรสำหรับคืนนี้ครับ?",
    stage: "Drinks & Menus",
    suggestedResponses: [
      "Certainly, sir! I will bring sparkling water right away. Tonight our chef highly recommends the grilled Atlantic salmon.",
      "Of course, Mr. Smith. One sparkling water with lemon. For the main course, our pan-seared ribeye steak is very popular."
    ],
    isFinished: false
  },
  {
    reply: "That sounds delicious. We will have the Caesar Salad as an appetizer and the grilled salmon for the main course, please.",
    translationTh: "ฟังดูน่าอร่อยมากครับ เราขอสั่งซีซาร์สลัดเป็นอาหารเรียกน้ำย่อย และแซลมอนย่างเป็นอาหารจานหลักครับ",
    stage: "Food Ordering",
    suggestedResponses: [
      "Excellent choice, sir! That is one Caesar Salad and one grilled salmon. May I recommend a glass of white wine to accompany your fish?",
      "Thank you, Mr. Smith. Your order of Caesar Salad and grilled salmon is noted. It will be served shortly."
    ],
    isFinished: false
  },
  {
    reply: "The salmon was cooked to perfection! Everything was wonderful. Could we have the bill whenever you are ready?",
    translationTh: "แซลมอนปรุงมาได้สมบูรณ์แบบมากครับ! ทุกอย่างยอดเยี่ยมมาก ขอใบเสร็จเช็คบิลได้เลยครับเมื่อท่านพร้อม",
    stage: "Billing & Farewell",
    suggestedResponses: [
      "I am delighted you enjoyed the meal, Mr. Smith. Here is your bill. Would you prefer to pay with cash or credit card?",
      "Thank you very much, sir. Here is your check whenever you are ready. I hope you had a lovely dining experience."
    ],
    isFinished: false
  },
  {
    reply: "I will pay with a credit card, please. Thank you so much for the attentive and polite service tonight!",
    translationTh: "ผมขอชำระด้วยบัตรเครดิตครับ ขอบคุณมากสำหรับการบริการที่เอาใจใส่และสุภาพในค่ำคืนนี้นะครับ!",
    stage: "Billing & Farewell",
    suggestedResponses: [
      "Thank you very much, Mr. Smith! It was our pleasure to serve you. We hope to welcome you back soon. Have a great evening!",
      "You are most welcome, sir. Thank you for dining with us tonight. Have a wonderful rest of your evening!"
    ],
    isFinished: true
  }
]

export async function POST(req: NextRequest) {
  try {
    await guardApi(req, { maxRequests: 30 })
    const body = await req.json()
    const { messages = [], userMessage = '', turnCount = 0, scenarioTitle = '' } = body

    const cleanUser = typeof userMessage === 'string' ? userMessage.trim() : ''
    const currentTurn = Number.isInteger(turnCount) ? Math.max(0, turnCount) : 0

    // Build conversation history transcript
    const historyText = Array.isArray(messages)
      ? messages
          .filter((m: { role?: string; text?: string }) => m && typeof m.text === 'string')
          .slice(-10)
          .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Waiter/Server' : 'Customer (Mr. Smith)'}: "${m.text}"`)
          .join('\n')
      : ''

    const SYSTEM_PROMPT = `You are Mr. Robert Smith, an international guest arriving and dining at a 5-star hotel restaurant.
You are roleplaying with a student who is practicing as your restaurant server/waiter.
Scenario context: "${scenarioTitle || 'Fine Dining Restaurant Service'}".

ROLEPLAY RULES:
1. Stay strictly in character as the guest (Mr. Smith). Never break character. Never act as an assistant, narrator, or tutor.
2. The waiter/server (the student) MUST be the one who greets you first when you enter the restaurant.
3. If this is the start of the interaction (Turn 0 or 1), respond warmly to the waiter's greeting:
   - Acknowledge their greeting politely (e.g. "Good evening! Thank you.")
   - Confirm that you have a table reservation for two under the name "Smith"
   - Ask if your table is ready.
4. Speak natural, polite, authentic conversational English appropriate for a restaurant customer.
5. Keep your response brief and clear: 1 to 2 sentences maximum.
6. Listen carefully to what the server (user) just said and react accordingly. If they answered correctly, move the meal forward smoothly. If they made a minor mistake or asked for clarification, respond politely.
7. Service Flow Stages across the dinner:
   - Turn 1: Greeting & Seating (responding to server greeting, confirming reservation under "Smith", requesting window table)
   - Turn 2: Menus & Drinks (ordering water, asking for drink/wine recommendation)
   - Turn 3: Food Ordering (ordering salad/appetizer, asking about grilled salmon or steak)
   - Turn 4: During Meal / Check-in (complimenting the food, or requesting the bill)
   - Turn 5+: Billing & Farewell (paying by credit card, thanking the server)

OUTPUT FORMAT:
You MUST respond strictly with a valid JSON object without markdown fences, with these exact keys:
{
  "reply": "Mr. Smith's response in English (1-2 sentences)",
  "translationTh": "คำแปลภาษาไทยของสิ่งที่ Mr. Smith พูดอย่างถูกต้อง เป็นธรรมชาติ",
  "stage": "Greeting & Seating" | "Drinks & Menus" | "Food Ordering" | "During Meal" | "Billing & Farewell",
  "suggestedResponses": [
    "ตัวเลือกประโยคภาษาอังกฤษที่ 1 ที่พนักงานควรตอบในรอบนี้",
    "ตัวเลือกประโยคภาษาอังกฤษที่ 2 ที่พนักงานควรตอบในรอบนี้"
  ],
  "isFinished": boolean
}`

    const userPrompt = `Previous conversation:
${historyText || '(Dinner just started)'}

Waiter/Server just said: "${cleanUser}"
Current turn number: ${currentTurn}

Respond as Mr. Smith following the required JSON schema:`

    let responseText = ''
    try {
      const provider = await getActiveProvider(req)
      const configuredModel = await getConfiguredModel(provider)

      if (provider === 'openai') {
        const client = await getOpenAI(req)
        const completion = await client.chat.completions.create({
          model: configuredModel,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        })
        responseText = completion.choices[0]?.message?.content || ''
      } else if (provider === 'claude') {
        const client = await getAnthropic(req)
        const completion = await client.messages.create({
          model: configuredModel,
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        })
        responseText = completion.content[0]?.type === 'text' ? completion.content[0].text : ''
      } else {
        const genAI = await getGemini(req)
        const model = genAI.getGenerativeModel({
          model: configuredModel,
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent(userPrompt)
        responseText = result.response.text()
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          reply?: string
          translationTh?: string
          stage?: string
          suggestedResponses?: string[]
          isFinished?: boolean
        }
        if (parsed.reply && parsed.reply.trim()) {
          return NextResponse.json({
            reply: parsed.reply.trim(),
            translationTh: parsed.translationTh?.trim() || '',
            stage: parsed.stage || 'Restaurant Service',
            suggestedResponses: Array.isArray(parsed.suggestedResponses) ? parsed.suggestedResponses.slice(0, 2) : [],
            isFinished: Boolean(parsed.isFinished) || currentTurn >= 6,
          })
        }
      }
    } catch (aiError) {
      console.warn('AI Simulation chat generation failed, using structured fallback:', aiError)
    }

    // High quality scripted fallback if AI is unavailable or fails
    const fallbackIndex = Math.min(currentTurn, FALLBACK_TURNS.length - 1)
    const fallbackItem = FALLBACK_TURNS[fallbackIndex] || FALLBACK_TURNS[FALLBACK_TURNS.length - 1]

    return NextResponse.json({
      reply: fallbackItem.reply,
      translationTh: fallbackItem.translationTh,
      stage: fallbackItem.stage,
      suggestedResponses: fallbackItem.suggestedResponses,
      isFinished: fallbackItem.isFinished || currentTurn >= FALLBACK_TURNS.length - 1,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

