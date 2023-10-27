const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// Backend endpoint for generating the story
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur } = req.body;

  let maxTokens;
  if (longueur === "1") {
    maxTokens = Math.floor(Math.random() * (800 - 600 + 1) + 600);
  } else if (longueur === "2") {
    maxTokens = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
  } else if (longueur === "3") {
    maxTokens = Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
  } else {
    // Default value if the selection is not valid
    maxTokens = 1000;
  }

  try {
    // Construct the user message from the received data
    const userMessage = `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire.`;

    // Use this information to create the request to the OpenAI API
    const requestBody = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: "You are the best storyteller there is." },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 1,
    };

    const storyResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!storyResponse.ok) {
      throw new Error("Error generating the story");
    }

    const storyData = await storyResponse.json();
    const storyMessage = storyData.choices[0].message.content;

    // Find the index of the first occurrence of a newline character
    const newLineIndex = storyMessage.indexOf("\n");

    if (newLineIndex !== -1) {
      const title = storyMessage.slice(0, newLineIndex).trim();
      const storyWithoutTitle = storyMessage.slice(newLineIndex).trim();
      res.json({ title, storyWithoutTitle }); // Renvoyez le titre et le texte séparément
    } else {
      // Handle the case where no newline character is found
      res.json({ title: "Title not found", storyMessage });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating the story" });
  }
});

module.exports = router;

