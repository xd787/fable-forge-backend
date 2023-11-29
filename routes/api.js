
const fetch = require("node-fetch");
const socketIo = require("socket.io");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;


function initializeWebSocket(server) {
// Setup Socket.io
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("generate-story", async (body) => {
    const { type, endingType, length } = body;

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

    let totalTokens = 0;

    while (totalTokens < tokenCount) {
      const remainingTokens = tokenCount - totalTokens;
      const maxTokensForChunk = remainingTokens > 250 ? 250 : remainingTokens;

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
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        if (!response.ok || !responseData.choices || !responseData.choices[0]) {
          socket.emit("storyChunk", {
            result: "Erreur lors de la génération de l'histoire",
          });
        }

        const generatedContent = responseData.choices[0].message.content.trim();

        totalTokens += generatedContent.length;

        //TITLE
        const titleRegex = /!(.*?)!/;
        const titleMatch = titleRegex.exec(generatedContent);
        const title = titleMatch ? titleMatch[1] : "";
        const contentWithoutTitle = generatedContent.replace(titleRegex, "");

        socket.emit("storyChunk", { title: title, chunck: contentWithoutTitle });

        if (totalTokens >= tokenCount) {
          socket.emit("storyChunk", { result: "Story generated successfully" });
          break;
        }
      } catch (error) {
        socket.emit("storyChunk", {
          error: "Error generating story",
          details: error.message,
        });
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

}

module.exports = initializeWebSocket;


