import axios from "axios";

const urls = {
    
    "Fitness": "https://memorybites06.app.n8n.cloud/webhook/f297916d-eb22-4d31-abdf-3084d0dfe9d1",
    "Sports": "https://memorybites06.app.n8n.cloud/webhook/d1aa42a3-815e-4590-be95-bef98c522b6b",
    "Mental": "https://memorybites06.app.n8n.cloud/webhook/965f80d8-da8d-4d3a-b2a1-79273888a65d",
}
export async function generateReply(message, user, category) {
    const url = urls[category] || urls["Fitness"];
    const reply = await axios.post(url, {
        user: message,
        id: user
    })

    console.log(reply.data[0].output)
    return reply.data[0].output;
}