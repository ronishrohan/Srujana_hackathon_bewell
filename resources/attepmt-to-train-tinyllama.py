# tinyllama_finetune.py
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    DataCollatorForLanguageModeling,
    Trainer, 
    TrainingArguments
)

# -----------------------------
# 1. Load and preprocess dataset
# -----------------------------
dataset_path = "output.jsonl"  # Your JSONL file path
dataset = load_dataset("json", data_files=dataset_path, split="train")

# Initialize tokenizer
tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")

# Format messages for training
def format_chat(example):
    # Combine system + user + assistant into TinyLLaMA chat template
    formatted = tokenizer.apply_chat_template(
        example["messages"], 
        tokenize=False, 
        add_generation_prompt=False
    )
    return {"formatted_text": formatted}

dataset = dataset.map(format_chat, remove_columns=dataset.column_names)

# Tokenize for causal LM
def tokenize_for_lm(example):
    tokens = tokenizer(
        example["formatted_text"],
        padding="max_length",
        truncation=True,
        max_length=512
    )
    tokens["labels"] = tokens["input_ids"].copy()  # full sequence prediction
    return tokens

train_data = dataset.map(tokenize_for_lm, batched=False, remove_columns=["formatted_text"])

# -----------------------------
# 2. Load TinyLLaMA model
# -----------------------------
model = AutoModelForCausalLM.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")

# -----------------------------
# 3. Setup training
# -----------------------------
data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)

training_args = TrainingArguments(
    output_dir="tinyllama-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=2,  # reduce if out of memory
    logging_steps=10,
    save_steps=100,
    weight_decay=0.01,
    fp16=torch.cuda.is_available()  # use mixed precision if GPU available
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    data_collator=data_collator
)

# -----------------------------
# 4. Fine-tune model
# -----------------------------
trainer.train()

# Save the model
trainer.save_model("tinyllama-finetuned")

# -----------------------------
# 5. Test the fine-tuned model
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

prompt_messages = [
    {"role": "system", "content": "You are a healthcare assistant."},
    {"role": "user", "content": "What are the symptoms of diabetes?"}
]

inputs = tokenizer.apply_chat_template(
    prompt_messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt"
)
inputs = {k: v.to(device) for k, v in inputs.items()}

outputs = model.generate(**inputs, max_new_tokens=150)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print("\n=== Model Response ===\n")
print(response)
