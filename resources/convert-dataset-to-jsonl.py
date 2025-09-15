import json

def convert_to_palm_format(openai_jsonl_path, palm_jsonl_path):
    with open(openai_jsonl_path, 'r', encoding='utf-8') as infile, \
         open(palm_jsonl_path, 'w', encoding='utf-8') as outfile:
        
        for line in infile:
            data = json.loads(line)
            messages = data.get("messages", [])
            palm_contents = []

            for message in messages:
                role = message.get("role")
                content = message.get("content")
                
                # Skip 'system' messages
                if role == "system":
                    continue

                # Map OpenAI role to PaLM equivalent
                palm_role = "user" if role == "user" else "model"
                palm_contents.append({
                    "role": palm_role,
                    "parts": [{"text": content}]
                })

            # Write converted line to output file
            output_line = json.dumps({"contents": palm_contents}, ensure_ascii=False)
            outfile.write(output_line + "\n")

# Example usage
convert_to_palm_format("output.jsonl", "output_palm.jsonl")
