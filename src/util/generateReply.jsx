import axios from "axios";

const urls = {
    
    "Fitness": "https://memorybites06.app.n8n.cloud/webhook/f297916d-eb22-4d31-abdf-3084d0dfe9d1",
    "Sports": "https://memorybites06.app.n8n.cloud/webhook/d1aa42a3-815e-4590-be95-bef98c522b6b",
    "Mental": "https://memorybites06.app.n8n.cloud/webhook/965f80d8-da8d-4d3a-b2a1-79273888a65d",
}
export async function generateReply(message, user) {
    // const url = urls[category] || urls["Fitness"];
    const res = await axios.post("http://localhost:3000/generate-reply", {
        message: message,
        
    })
    console.log(res.data.reply)

    const reply = res.data.reply;

    console.log(reply)
    return reply;
}