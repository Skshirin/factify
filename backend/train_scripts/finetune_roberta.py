# ai-model/finetune_roberta.py

import pandas as pd
from datasets import Dataset
from transformers import RobertaTokenizerFast, RobertaForSequenceClassification
from transformers import TrainingArguments, Trainer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from newsapi import NewsApiClient
import numpy as np
import os

# ========== 1️⃣ Load Base Dataset ==========
base_dataset_path = "ai-model/dataset/final_dataset.csv"
df = pd.read_csv(base_dataset_path, engine='python', quotechar='"', on_bad_lines='skip')

# Drop NaNs and shuffle
df = df.dropna().sample(frac=1).reset_index(drop=True)

# ✅ Ensure labels are int
df["label"] = df["label"].astype(int)
print(f"Base dataset loaded: {df.shape}")

# ========== 2️⃣ Augment Dataset with Live News via NewsAPI ==========
USE_NEWSAPI = True
if USE_NEWSAPI:
    api_key = "43e46d91522c4b75aa37f75b28fce181"  # Your API key
    newsapi = NewsApiClient(api_key=api_key)

    articles = newsapi.get_top_headlines(language='en', page_size=30)
    live_data = []
    for a in articles.get("articles", []):
        title = a.get("title")
        desc = a.get("description")
        if title and desc:
            live_data.append({
                "content": f"{title} {desc}",
                "label": 1  # Assume real news
            })

    if live_data:
        df_live = pd.DataFrame(live_data)
        df = pd.concat([df, df_live], ignore_index=True)
        print(f"Augmented with {len(df_live)} live news → New shape: {df.shape}")

# ========== 3️⃣ Prepare Dataset ==========
# Rename text->content if exists
df.rename(columns={"text": "content"}, inplace=True, errors="ignore")

# Fill NaNs with empty string and convert to str
df["content"] = df["content"].fillna("").astype(str)

# ✅ Keep only content + label and remove duplicate columns
df = df[["content", "label"]]
df = df.loc[:, ~df.columns.duplicated()]
df = df.drop_duplicates().reset_index(drop=True)
print(f"✅ Final dataset shape: {df.shape}")

# Hugging Face Dataset
dataset = Dataset.from_pandas(df)

# Tokenizer
tokenizer = RobertaTokenizerFast.from_pretrained("roberta-base")

def tokenize(batch):
    texts = [str(x) for x in batch["content"]]
    return tokenizer(texts, padding=True, truncation=True, max_length=256)

dataset = dataset.map(tokenize, batched=True)
dataset = dataset.train_test_split(test_size=0.2)

# ========== 4️⃣ Load Model ==========
model = RobertaForSequenceClassification.from_pretrained(
    "roberta-base",
    num_labels=2
)

# Training Args
training_args = TrainingArguments(
    output_dir="./ai-model/results_roberta",
    num_train_epochs=2,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    warmup_steps=50,
    weight_decay=0.01,
    logging_dir="./ai-model/logs_roberta",
    evaluation_strategy="steps",  # Evaluate periodically
    eval_steps=100,
    save_strategy="steps",
    save_steps=500,
    save_total_limit=3,
    load_best_model_at_end=True,
    logging_steps=50,
)

# Metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    acc = accuracy_score(labels, preds)
    prec, rec, f1, _ = precision_recall_fscore_support(labels, preds, average="binary")
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1}

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics,
)

print("🚀 Starting RoBERTa training...")
trainer.train()

# ========== 5️⃣ Save Model ==========
save_dir = "ai-model/roberta-fake-news_finetuned"
os.makedirs(save_dir, exist_ok=True)
model.save_pretrained(save_dir)
tokenizer.save_pretrained(save_dir)

print(f"✅ Training complete. RoBERTa model saved to '{save_dir}'.")
