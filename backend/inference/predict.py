import os
import torch
import pickle
import numpy as np
from scipy.special import softmax
from serpapi import GoogleSearch
from transformers import (
    DistilBertTokenizer, DistilBertForSequenceClassification,
    RobertaTokenizer, RobertaForSequenceClassification
)
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model

# ----------------------------
# Device Setup
# ----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------------------------
# Load DistilBERT
# ----------------------------
distilbert_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/distilbert-fake-news_finetuned"))
distilbert_tokenizer = DistilBertTokenizer.from_pretrained(distilbert_path, local_files_only=True)
distilbert_model = DistilBertForSequenceClassification.from_pretrained(distilbert_path, local_files_only=True).to(device)
distilbert_model.eval()

# ----------------------------
# Load RoBERTa
# ----------------------------
roberta_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/roberta-fake-news_finetuned"))
roberta_tokenizer = RobertaTokenizer.from_pretrained(roberta_path, local_files_only=True)
roberta_model = RobertaForSequenceClassification.from_pretrained(roberta_path, local_files_only=True).to(device)
roberta_model.eval()

# ----------------------------
# Load CNN, LSTM, BiLSTM
# ----------------------------
lstm_model = load_model(os.path.join(os.path.dirname(__file__), "../models/lstm-model/lstm_model.h5"), compile=False)
bilstm_model = load_model(os.path.join(os.path.dirname(__file__), "../models/bilstm-model/bilstm_model.h5"), compile=False)
cnn_model = load_model(os.path.join(os.path.dirname(__file__), "../models/cnn-model/cnn_model.h5"), compile=False)

# ----------------------------
# Load Tokenizers for CNN/LSTM/BiLSTM
# ----------------------------
with open(os.path.join(os.path.dirname(__file__), "../models/lstm-model/lstm_tokenizer.pkl"), "rb") as f:
    lstm_tokenizer = pickle.load(f)

with open(os.path.join(os.path.dirname(__file__), "../models/bilstm-model/tokenizer.pkl"), "rb") as f:
    tokenizer = pickle.load(f)

with open(os.path.join(os.path.dirname(__file__), "../models/cnn-model/cnn_tokenizer.pkl"), "rb") as f:
    cnn_tokenizer = pickle.load(f)

# ----------------------------
# Helper: Vectorize input text for RNN/CNN models
# ----------------------------
def vectorize_text(text, tokenizer):
    seq = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(seq, maxlen=200)  # (1, 200)
    return padded

# ----------------------------
# Prediction functions
# ----------------------------
def predict_distilbert(text):
    inputs = distilbert_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = distilbert_model(**inputs)
    probs = softmax(outputs.logits.cpu().numpy()[0])
    return {"fake": float(probs[0]), "real": float(probs[1])}

def predict_roberta(text):
    inputs = roberta_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = roberta_model(**inputs)
    probs = softmax(outputs.logits.cpu().numpy()[0])
    return {"fake": float(probs[0]), "real": float(probs[1])}

def predict_cnn(text_vectorized):
    # Clip indices to embedding input range
    text_vectorized = np.clip(text_vectorized, 0, 9999)

    if len(text_vectorized.shape) == 3:
        text_vectorized = text_vectorized.reshape(text_vectorized.shape[0], text_vectorized.shape[2])

    pred = cnn_model.predict(text_vectorized, verbose=0)

    if pred.shape[1] == 1:
        prob = float(pred[0][0])
        return {"fake": 1 - prob, "real": prob}
    elif pred.shape[1] == 2:
        return {"fake": float(pred[0][0]), "real": float(pred[0][1])}
    else:
        raise ValueError(f"Unexpected CNN output shape: {pred.shape}")




def predict_lstm(text_vectorized):
    # Ensure correct shape (batch_size, maxlen)
    if len(text_vectorized.shape) == 3:
        text_vectorized = text_vectorized.reshape(text_vectorized.shape[0], text_vectorized.shape[2])

    pred = lstm_model.predict(text_vectorized, verbose=0)

    # Handle sigmoid / softmax outputs
    if pred.shape[1] == 1:  # sigmoid
        prob = float(pred[0][0])
        return {"fake": 1 - prob, "real": prob}
    elif pred.shape[1] == 2:  # softmax
        return {"fake": float(pred[0][0]), "real": float(pred[0][1])}
    else:
        raise ValueError(f"Unexpected LSTM output shape: {pred.shape}")


def predict_bilstm(text_vectorized):
    # Ensure correct shape (batch_size, maxlen)
    if len(text_vectorized.shape) == 3:
        text_vectorized = text_vectorized.reshape(text_vectorized.shape[0], text_vectorized.shape[2])

    if len(text_vectorized.shape) == 1:  # if single sequence, add batch dim
        text_vectorized = np.expand_dims(text_vectorized, axis=0)

    pred = bilstm_model.predict(text_vectorized, verbose=0)

    # Handle sigmoid / softmax outputs
    if pred.shape[1] == 1:  # sigmoid
        prob = float(pred[0][0])
        return {"fake": 1 - prob, "real": prob}
    elif pred.shape[1] == 2:  # softmax
        return {"fake": float(pred[0][0]), "real": float(pred[0][1])}
    else:
        raise ValueError(f"Unexpected BiLSTM output shape: {pred.shape}")

# ----------------------------
# Max Voting Inference
# ----------------------------
def predict_with_max_voting(text, text_vectorized=None):
    results = {}

    # Transformer models
    distilbert_pred = predict_distilbert(text)
    roberta_pred = predict_roberta(text)
    
    results["distilbert"] = {
        "confidence": max(distilbert_pred["fake"], distilbert_pred["real"]),
        "fake_percentage": round(distilbert_pred["fake"] * 100, 2),
        "real_percentage": round(distilbert_pred["real"] * 100, 2),
    }
    
    results["roberta"] = {
        "confidence": max(roberta_pred["fake"], roberta_pred["real"]),
        "fake_percentage": round(roberta_pred["fake"] * 100, 2),
        "real_percentage": round(roberta_pred["real"] * 100, 2),
    }

    # Classical + RNN models
    if text_vectorized is not None:
        cnn_pred = predict_cnn(text_vectorized)
        lstm_pred = predict_lstm(text_vectorized)
        bilstm_pred = predict_bilstm(text_vectorized)
        
        results["cnn"] = {
            "confidence": max(cnn_pred["fake"], cnn_pred["real"]),
            "fake_percentage": round(cnn_pred["fake"] * 100, 2),
            "real_percentage": round(cnn_pred["real"] * 100, 2),
        }
        results["lstm"] = {
            "confidence": max(lstm_pred["fake"], lstm_pred["real"]),
            "fake_percentage": round(lstm_pred["fake"] * 100, 2),
            "real_percentage": round(lstm_pred["real"] * 100, 2),
        }
        results["bilstm"] = {
            "confidence": max(bilstm_pred["fake"], bilstm_pred["real"]),
            "fake_percentage": round(bilstm_pred["fake"] * 100, 2),
            "real_percentage": round(bilstm_pred["real"] * 100, 2),
        }

    # Pick best model by confidence
    best_model = max(results.items(), key=lambda x: x[1]["confidence"])
    best_model_name, best_model_data = best_model

    return {
        "model_used": best_model_name,
        "confidence": best_model_data["confidence"],
        "fake_percentage": best_model_data["fake_percentage"],
        "real_percentage": best_model_data["real_percentage"],
        "all_model_results": results
    }

# ----------------------------
# SerpAPI integration
# ----------------------------
def serpapi_search(query):
    api_key = "SERPAPI_KEY"
    if not api_key:
        return []

    params = {
        "engine": "google",
        "q": query,
        "api_key": api_key,
        "num": 10,
        "hl": "en"
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        links = [res["link"] for res in results.get("organic_results", []) if "link" in res]
        return links
    except Exception as e:
        print("SerpAPI error:", e)
        return []

if __name__ == "__main__":
    text = "Rahul Gandhi is from the male gender"
    text_vectorized = vectorize_text(text, tokenizer)
    results = predict_with_max_voting(text, text_vectorized)
    print(results)
