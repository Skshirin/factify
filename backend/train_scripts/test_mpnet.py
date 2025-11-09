import os
import torch
import json
from sentence_transformers import SentenceTransformer, util

# ----------------------------
# Load MPNet model
# ----------------------------
mpnet_model = SentenceTransformer('all-mpnet-base-v2')

# ----------------------------
# Load curated fact dataset
# ----------------------------
with open(os.path.join(os.path.dirname(__file__), "../datasets/facts.json"), "r") as f:
    facts = json.load(f)

fact_claims = [f["claim"] for f in facts]
fact_labels = [f["label"] for f in facts]

# Precompute embeddings
fact_embeddings = mpnet_model.encode(fact_claims, convert_to_tensor=True)

# ----------------------------
# Function to check semantic similarity
# ----------------------------
def mpnet_check(text, threshold=0.75):
    query_emb = mpnet_model.encode(text, convert_to_tensor=True)
    cosine_scores = util.cos_sim(query_emb, fact_embeddings)[0]
    
    max_score_idx = int(torch.argmax(cosine_scores))
    max_score = float(cosine_scores[max_score_idx])
    predicted_label = fact_labels[max_score_idx] if max_score >= threshold else "Unknown / Not enough info"
    
    return {
        "similarity": max_score,
        "matched_claim": fact_claims[max_score_idx],
        "mpnet_verdict": predicted_label
    }

# ----------------------------
# Interactive CLI
# ----------------------------
if __name__ == "__main__":
    print("=== MPNet Fake/Real News Tester ===")
    print("Type 'exit' to quit.\n")
    
    while True:
        user_input = input("Enter your claim: ").strip()
        if user_input.lower() == "exit":
            break
        result = mpnet_check(user_input)
        print("\nMPNet Result:")
        print(f"Matched Claim: {result['matched_claim']}")
        print(f"Similarity Score: {result['similarity']:.3f}")
        print(f"Verdict: {result['mpnet_verdict']}\n")
