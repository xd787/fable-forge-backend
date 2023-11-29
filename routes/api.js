const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// POST: Generate a story with all settings (type, style, length)
router.post("/generate-story", async (req, res) => {
  const { type, endingType, length } = req.body;

  // Longueur d'histoire possible (en token)
  const LENGTH_MAP = {
    Courte: { min: 800, max: 1300 },
    Moyenne: { min: 1500, max: 2000 },
    Longue: { min: 2000, max: 2500 },
  };
  const tokenCount =
    Math.floor(
      Math.random() * (LENGTH_MAP[length].max - LENGTH_MAP[length].min + 1)
    ) + LENGTH_MAP[length].min;

  const prompt = `Je souhaite créer une histoire de genre ${type}. Je veux une ${endingType}.`;

  // Initialize variables
  let totalTokens = 0;
  let generatedStory = "";

  // LOOP TOKEN
  while (totalTokens < tokenCount) {
    const remainingTokens = tokenCount - totalTokens;
    const maxTokensForChunk = remainingTokens > 250 ? 250 : remainingTokens;

    //MESSAGE BODY API
    const data = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: `
          Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
          Tu vas créer une seule et unique histoire avec une fin qui ne dépassera pas le nombre maximum de tokens.\n-
          Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
          Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1,
      max_tokens: maxTokensForChunk,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
    };

    try {
      // FETCH API
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(data),
        }
      );

      //REPONSE API
      const responseData = await response.json();
      if (!response.ok || !responseData.choices || !responseData.choices[0]) {
        res.json({ result: "Erreur lors de la génération de l'histoire" });
      }
      const generatedContent = responseData.choices[0].message.content.trim();

      //TOTAL TOKEN COUNT
      totalTokens += generatedContent.length;
      generatedStory += generatedContent;

      // Extraction of the title and response content
      const titleRegex = /!(.*?)!/;
      const titleMatch = titleRegex.exec(generatedStory);
      const title = titleMatch ? titleMatch[1] : "";
      const contentWithoutTitle = generatedStory.replace(titleRegex, "");

      //BREAK WHEN DONE 
      if (totalTokens >= tokenCount) {
        
        console.log(contentWithoutTitle.length)
        return res.json({
          result: "Story generated successfully",
          title,
          contentWithoutTitle,
        });
       
      }


      //CATCH ERROR
    } catch (error) {
      // Handle errors during API call
      return res
        .status(500)
        .json({ error: "Error generating story", details: error.message });
    }
  }
});

module.exports = router;
