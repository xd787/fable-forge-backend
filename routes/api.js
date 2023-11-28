// file that calls the API from the backend
// Not used for the moment, to be kept for future development of the mobile application.

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL

const MAX_TOKENS = {
  Courte: { min: 400, max: 800 },
  Moyenne: { min: 800, max: 1200 },
  Longue: { min: 1200, max: 1600 },
};

// POST: Generate a story with all settings (type, style, length)
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur } = req.body;

  // USER MESSAGE
  const prompt = `Je souhaite créer une histoire de genre ${genre} de longueur ${longueur}. Je veux une ${fin}.`;

  // LENGTH GENERATOR
  const lengthKey = ["Courte", "Moyenne", "Longue"].includes(longueur)
    ? longueur
    : "Courte";
  const { min, max } = MAX_TOKENS[lengthKey];
  const maxTokens = Math.floor(Math.random() * (max - min + 1) + min);



  const generateNextChunk = async () => {
    let totalTokens = 0;
    const storyChunks = [];

    while (totalTokens < maxTokens) {
      // Generate a chunk with a maximum of 250 tokens
      const remainingTokens = maxTokens - totalTokens;
      const tokensInThisChunk = remainingTokens > 250 ? 250 : remainingTokens;

    // Préparation de la requête à envoyer à l'API
    const data = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: `
          Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
          Tu vas créer une seule et unique histoire.\n-
          Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
          Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`
        },
        { 
          role: "user",
          content: prompt 
        }, // Message de l'utilisateur actuel
      ],
  
      // Contrôle du style et de la diversité de la génération de texte
      temperature: 1,
      max_tokens: 250,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
    };
  

      try {
        // Fetch content for this chunk from the API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(data),
        });

        // Process the response and extract content for this chunk
        const responseData = await response.json();
        const generatedContent = responseData.generatedContent; // Adjust based on API response structure

        // Extraction of the title and response content
        const titleRegex = /!(.*?)!/;
        const titleMatch = titleRegex.exec(generatedContent);
        const title = titleMatch ? titleMatch[1] : "";

        // Separating title from the main content
        const contentWithoutTitle = generatedContent.replace(titleRegex, "");

        // Constructing the chunk with title and response content
        const chunk = {
          title,
          content: contentWithoutTitle,
        };

        // Push the generated chunk to the storyChunks array
        storyChunks.push(chunk);

        // Update totalTokens with tokensInThisChunk
        totalTokens += tokensInThisChunk;
      } catch (error) {
        // Handle errors from API fetch
        throw new Error("Error fetching story content");
      }
    }

    // Return the generated story chunks
    return storyChunks;
  };

  try {
    // Generate the story chunks
    const story = await generateNextChunk();

    // Respond with the generated story chunks or handle as needed
    res.json({ result: "Story generated successfully", story });
  } catch (error) {
    // Handle errors if any
    res.status(500).json({ result: "Error generating story", error: error.message });
  }
});

module.exports = router;

