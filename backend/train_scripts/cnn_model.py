import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, Conv1D, GlobalMaxPooling1D, Dense, Dropout
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split

# ---------------------------
# Build CNN model
# ---------------------------
def build_cnn(max_words, max_len, embedding_dim=100):
    model = Sequential()
    model.add(Embedding(input_dim=max_words, output_dim=embedding_dim, input_length=max_len))
    model.add(Conv1D(filters=128, kernel_size=5, activation='relu'))
    model.add(GlobalMaxPooling1D())
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

# ---------------------------
# Main training function
# ---------------------------
def train_cnn(csv_path="../dataset/final_dataset.csv", save_path="backend/models/cnn_model.h5"):
    # 1. Load dataset
    df = pd.read_csv(csv_path)

    # Assume columns: "text", "label"
    texts = df["text"].astype(str).tolist()
    labels = df["label"].values  # 0 = fake, 1 = real

    # 2. Tokenize text
    max_words = 10000
    max_len = 200
    tokenizer = Tokenizer(num_words=max_words)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    X = pad_sequences(sequences, maxlen=max_len)
    y = np.array(labels)

    # 3. Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Build model
    model = build_cnn(max_words, max_len)

    # 5. Train
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=5,
        batch_size=64,
        verbose=1
    )

    # 6. Save model + tokenizer
    model.save(save_path)
    import pickle
    with open("backend/models/cnn_tokenizer.pkl", "wb") as f:
        pickle.dump(tokenizer, f)

    print(f"✅ Model saved at {save_path}")
    return history

if __name__ == "__main__":
    train_cnn()
