import dotenv from 'dotenv';
import { TwitchRepository } from "./src/infrastructure/repositories/TwitchRepository";

dotenv.config(); 


async function probarLlamada() {
    const client = new TwitchRepository();
    
    console.log("Realizando consulta a Twitch...");
    
    const streamer = await client.searchStreamerById(83232866);
    
    console.log("Resultado obtenido:");
    console.log(streamer);
}

probarLlamada();