import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  console.log("go handler ");
  if (req.method === "POST") {
    const messages = req.body.text;
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.9,
        max_tokens: 1024,
      });

      const chatGPTResponseText = response.data.choices[0].message?.content;
      console.log("chatGPTResponseText ", chatGPTResponseText);

      res.status(200).json({ text: chatGPTResponseText });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
