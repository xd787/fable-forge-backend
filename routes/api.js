const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;

router.post("/generate-story", async (req, res) => {
    const { genre, fin, longueur, messages } = req.body;

    let maxTokens;
    if (longueur === "1") {
        maxTokens = Math.floor(Math.random() * (800 - 600 + 1) + 600);  // Vos valeurs semblaient être incorrectes ici
    } else if (longueur === "2") {
        maxTokens = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
    } else if (longueur === "3") {
        maxTokens = Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
    } else {
        maxTokens = 1000;
    }

    const conversation = messages || [
        { role: "system", content: "You are the best storyteller there is." },
        { role: "user", content: `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire.` }  // Votre message initial
    ];

    try {
        let totalGenerated = '';

        // Nous utilisons une boucle pour effectuer plusieurs requêtes jusqu'à ce que nous atteignions maxTokens
        while (totalGenerated.split(' ').length < maxTokens) {
            const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo-16k",
                    messages: conversation,
                    max_tokens: Math.min(20, maxTokens - totalGenerated.split(' ').length),  // Ne demandez que les tokens nécessaires
                    temperature: 1,
                }),
            });

            if (!storyResponse.ok) {
                throw new Error("Error generating the story");
            }

            const storyData = await storyResponse.json();
            const storyPart = storyData.choices[0].message.content;
            totalGenerated += storyPart;

            // Ajoutez le contenu généré à l'historique de la conversation pour la prochaine requête
            conversation.push({ role: "user", content: storyPart });
        }

        // Traitement pour séparer le titre et l'histoire
        const newLineIndex = totalGenerated.indexOf("\n");
        if (newLineIndex !== -1) {
            const title = totalGenerated.slice(0, newLineIndex).trim();
            const storyWithoutTitle = totalGenerated.slice(newLineIndex).trim();
            res.json({ title, storyWithoutTitle });
        } else {
            res.json({ title: "Title not found", storyWithoutTitle: totalGenerated });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error generating the story: ${error.message}` });
    }
});

module.exports = router;
