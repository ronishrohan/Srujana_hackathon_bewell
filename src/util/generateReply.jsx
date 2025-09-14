import axios from "axios";


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