// io: handles global server socket connections
// socket: handles specific client-to-server tunnel (1 socket = 1 client)
function generateRoomId() {
  // Generate a random alphanumeric room ID
  const roomId = Math.random().toString(36).substring(2, 8);
  return roomId;
}

function socketInitiation(io) {
  const rooms = {}; // Store room/channel associations

  io.on("connection", (socket) => {
    socket.on("join", (data) => {
      const roomId = generateRoomId(); // Implement your own room/channel ID generation

      socket.join(roomId);
      rooms[socket.id] = roomId; // Store the room/channel association

      io.to(roomId).emit("join", {
        socketId: socket.id,
        users: Array.from(io.sockets.adapter.rooms.get(roomId)),
      });
    });

    //CREATE ROOM FOR MULTI USER
    // socket.on("message",data => {
    //   const { message, roomId } = data;
    //   console.log(`Socket ${socket.id} transmitting in room ${roomId}. . .`);
    //   // send message to all in room
    //   io.to(roomId).emit("message", { message });
    // });

    socket.on("message", async (data) => {
      // RECEPTION DATA
      const parsedData = JSON.parse(data);
      const { type, endingType, length } = parsedData.data;
      const roomId = rooms[socket.id];

      //CALCULE LENGTH STORY
      const LENGTH_MAP = {
        Courte: { min: 800, max: 1300 },
        Moyenne: { min: 1500, max: 2000 },
        Longue: { min: 2000, max: 2500 },
      };

      const totalTokenCount =
        Math.floor(
          Math.random() * (LENGTH_MAP[length].max - LENGTH_MAP[length].min + 1)
        ) + LENGTH_MAP[length].min;

      let tokenGenerated = 0;
      let generatedStory = "";

      while (tokenGenerated < totalTokenCount) {
        let remainingTokens = totalTokenCount - tokenGenerated;
        const maxTokensForChunk = remainingTokens > 250 ? 250 : remainingTokens;

        //PROMPT
        let prompt = `Je souhaite créer une histoire de genre ${type}. Je veux une ${endingType}.`;
        let apiMessage = `
        Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
        Tu vas créer une seule et unique histoire avec une fin et qui ne dépassera pas le nombre maximum de tokens.\n-
        Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
        Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`;

        if (generatedStory.length > 0) {
          prompt = `Continues la suite de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
          apiMessage = `
          Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
          Tu vas créer une seule et unique histoire avec une fin et qui ne dépassera pas le nombre maximum de tokens.\n-
          Tu ne commenceras pas les histoires par \"il était une fois\".\n- `;
        }
        if (remainingTokens < 250) {
          prompt = `Ecris la fin de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
        }

        //MESSAGE TO API
        const messageAPI = {
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "system",
              content: apiMessage,
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

        //APPEL TO API
        try {
          console.log("send to api");
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(messageAPI),
          });

          const responseData = await response.json();

          // NO REPONSE DE L'API
          if (
            !response.ok ||
            !responseData.choices ||
            !responseData.choices[0]
          ) {
            io.to(roomId).emit("message", {
              type: "storyChunk",
              data: {
                result: "Erreur lors de la génération de l'histoire",
              },
            });
            return;
          }

          // REPONSE API POSITIVE
          const generatedContent =
            responseData.choices[0].message.content.trim();
          const generatedTokens = generatedContent.split(" ").length;

          //TITLE
          const titleRegex = /!(.*?)!/;
          const titleMatch = titleRegex.exec(generatedContent);
          const contentWithoutTitle = generatedContent.replace(titleRegex, "");
          generatedStory = contentWithoutTitle;

          //SEND STORY TO FRONT
          let chunkData = {};

          if (tokenGenerated === 0) {
            chunkData = {
              type: "storyChunk",
              data: { chunk: contentWithoutTitle, title: titleMatch[1] },
            };
          } else {
            chunkData = {
              type: "storyChunk",
              data: { chunk: contentWithoutTitle },
            };
          }
          console.log(
            "tokenGenerated",
            tokenGenerated,
            "total",
            totalTokenCount
          );

          tokenGenerated += generatedTokens;
          io.to(roomId).emit("storyChunk", { chunkData });

          // ERROR DE GENERATION
        } catch (error) {
          io.to(roomId).emit("storyChunk", {
            type: "storyChunk",
            data: { error: "Error generating story", details: error.message },
          });
        }
      }
      console.log("end of the story");
      io.to(roomId).emit("message", { type: "storyEnd" });
    });

    socket.on("leave", () => {
      const roomId = rooms[socket.id];
      if (roomId) {
        socket.leave(roomId);
        io.to(roomId).emit("leave", { socketId: socket.id });
        delete rooms[socket.id]; // Remove the association when leaving
      }
    });

    socket.on("disconnect", () => {
      const roomId = rooms[socket.id];
      if (roomId) {
        io.to(roomId).emit("leave", { socketId: socket.id });
        delete rooms[socket.id]; // Remove the association on disconnect
      }
    });
  });
}
module.exports = { socketInitiation };
