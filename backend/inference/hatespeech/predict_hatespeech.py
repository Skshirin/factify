import numpy as np
import pickle
import os
from tensorflow.keras.models import load_model
from inference.hatespeech.preprocessing import preprocess_texts


# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "bilstm_model.h5")
TOKENIZER_PATH = os.path.join(os.path.dirname(__file__), "saved_model", "tokenizer.pkl")

# Load trained model
model = load_model(MODEL_PATH)

# Load tokenizer
with open(TOKENIZER_PATH, "rb") as handle:
    tokenizer = pickle.load(handle)

# Label mapping (adjust if different)
mapping = {0: "Hate Speech", 1: "Offensive Language", 2: "Neither"}

def predict_hatespeech(texts):
    """
    Takes list of texts -> returns predictions with label, confidence, and scores.
    """
    X, _ = preprocess_texts(texts, tokenizer)
    preds = model.predict(X)

    results = []
    for i, pred in enumerate(preds):
        label_idx = np.argmax(pred)
        label = mapping[label_idx]
        confidence = float(np.max(pred))
        scores = {mapping[j]: float(pred[j]) for j in range(len(mapping))}
        results.append({
            "label": label,
            "confidence": confidence,
            "scores": scores
        })

    return results

# For standalone testing
if __name__ == "__main__":
    while True:
        user_input = input("Enter a sentence (or type 'quit' to exit): ")
        if user_input.lower() == "quit":
            print("Exiting...")
            break

        results = predict_hatespeech([user_input])
        res = results[0]
        print(f"\nText: {user_input}")
        print(f"Prediction: {res['label']} ({res['confidence']*100:.2f}%)")
        print("Scores:", res["scores"])
        print("-" * 80, "\n")
