const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

let roomId;
let storyGenerationFlag = false;

function socketInitiation(io) {

  io.on("connection", (socket) => {
    socket.on("join", (data) => {
        roomId  = data;
        console.log(`Socket ${socket.id} joining room ${roomId}. . .`);
    
        // Add user to group (room) to receive specific messages
        socket.join(roomId);
        // Inform room of new user and send list of clients connected to specific room
        io.to(roomId).emit("join", {
          socketId: socket.id,
          users: Array.from(io.sockets.adapter.rooms.get(roomId)),
        });
        storyGenerationFlag = true

    });

    socket.on("message", async (data) => {
      // RECEPTION DATA
      const parsedData = JSON.parse(data);
      const { type, endingType, length } = parsedData.data;

      //CALCULE LENGTH STORY
      const LENGTH_MAP = {
        Courte: { min: 800, max: 1250 },
        Moyenne: { min: 1500, max: 2000 },
        Longue: { min: 2000, max: 2500 },
      };

      const totalTokenCount = LENGTH_MAP[length].max
        // Math.floor(
        //   Math.random() * (LENGTH_MAP[length].max - LENGTH_MAP[length].min + 1)
        // ) + LENGTH_MAP[length].min;

      let tokenGenerated = 0;
      let generatedStory = "";

      if(storyGenerationFlag){
        async function generatedChunck() {

            let remainingTokens = totalTokenCount - tokenGenerated;
            const maxTokensForChunk = 250
    
            //PROMPT
            let prompt = `Je souhaite créer une histoire de genre ${type}. Je veux une ${endingType}.`;
            let apiMessage = `
            Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
            Tu vas créer une seule et unique histoire qui ne dépassera pas le nombre maximum de tokens.\n-
            Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
            Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`;
    
            if (generatedStory.length > 0) {
              prompt = `Continues la suite de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
              apiMessage = `
              Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
              Tu vas créer une seule et unique histoire qui ne dépassera pas le nombre maximum de tokens.\n-
              Tu ne commenceras pas les histoires par \"il était une fois\".\n- `;
            }
            if (remainingTokens <= 250) {
            apiMessage = `
                Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
                Tu vas écrire la fin de l'histoire en ne dépassant pas le nombre maximum de tokens.\n-`;
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
                io.to(roomId).emit("message", JSON.stringify({
                  type: "storyChunk",
                  data: {
                    result: "Erreur lors de la génération de l'histoire",
                  },
                }));
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
              io.to(roomId).emit("message", JSON.stringify({ chunkData }));
    
              // Generate next chunk if needed
              if (tokenGenerated < totalTokenCount) {
                await generatedChunck() 
              } else {
                // All chunks generated, emit story end signal
                io.to(roomId).emit("message", JSON.stringify({ type: "storyEnd" }));
              }
    
              // ERROR DE GENERATION
            } catch (error) {
              io.to(roomId).emit("message", JSON.stringify({
                type: "storyChunk",
                data: { error: "Error generating story", details: error.message },
              }));
            }
           
          }
      }

      await generatedChunck();
     
});

socket.on("leave", data => {
        const { roomId } = data;
        console.log(`Socket ${socket.id} leaving room ${roomId}. . .`);
        storyGenerationFlag= false
        socket.leave(roomId);
        io.to(roomId).emit("leave", { socketId: socket.id });
        

      });
  });
}


module.exports = { socketInitiation };
