const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

async function generateStoryPart(previousParts, tokensToGenerate) {
    let conversationHistory = [
        { role: "system", content: "You are the best storyteller there is." }
    ];

    // Ajoutez les parties précédentes à l'historique de la conversation
    for (const part of previousParts) {
        conversationHistory.push({ role: "user", content: part });
    }

    // Ajoutez la dernière instruction à l'historique de la conversation
    conversationHistory.push({ role: "user", content: "Continuez l'histoire." });

    const requestBody = {
        model: "gpt-3.5-turbo-16k",
        messages: conversationHistory,
        max_tokens: tokensToGenerate,
        temperature: 1,
    };

    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
    });

    if (!storyResponse.ok) {
        throw new Error("Error generating story part from OpenAI API");
    }

    const storyData = await storyResponse.json();
    const storyPart = storyData.choices[0].message.content;

    return storyPart;
}

// Backend endpoint for generating the story
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur } = req.body;

  try {
      let userMessage = `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire.`;

      const maxTokens = calculateMaxTokens(longueur);
      let generatedStory = await generateStoryPart([userMessage], maxTokens);

      res.json({ storyWithoutTitle: generatedStory });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: `Error generating the story: ${error.message}` });
  }
});

// Fonction pour calculer le nombre total de tokens en fonction de la longueur
function calculateMaxTokens(longueur) {
    if (longueur === "1") {
        return Math.floor(Math.random() * (800 - 600 + 1) + 600);
    } else if (longueur === "2") {
        return Math.floor(Math.random() * (1500 - 800 + 1) + 800);
    } else if (longueur === "3") {
        return Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
    } else {
        return 1000; // Nombre de tokens par défaut si aucune sélection valide
    }
}

module.exports = router;
