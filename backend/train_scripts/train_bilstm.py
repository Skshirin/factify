import tensorflow as tf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, Bidirectional, LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import pickle
import os

# ======================
# 1. Load Dataset
# ======================
# dataset_path = os.path.join("backend", "dataset", "final_dataset.csv")
# df = pd.read_csv(dataset_path)
df = pd.read_csv(r"C:\Factify\backend\dataset\final_dataset.csv")

# Ensure text is string
df["text"] = df["text"].astype(str)

# Labels: 0 = Real, 1 = Fake
X = df["text"].values
y = df["label"].values

# ======================
# 2. Train/Test Split
# ======================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ======================
# 3. Tokenization & Padding
# ======================
MAX_WORDS = 20000
MAX_LEN = 200

tokenizer = Tokenizer(num_words=MAX_WORDS, oov_token="<OOV>")
tokenizer.fit_on_texts(X_train)

X_train_seq = tokenizer.texts_to_sequences(X_train)
X_test_seq = tokenizer.texts_to_sequences(X_test)

X_train_pad = pad_sequences(X_train_seq, maxlen=MAX_LEN, padding="post", truncating="post")
X_test_pad = pad_sequences(X_test_seq, maxlen=MAX_LEN, padding="post", truncating="post")

# ======================
# 4. Build Bi-LSTM Model
# ======================
model = Sequential()
model.add(Embedding(MAX_WORDS, 128, input_length=MAX_LEN))
model.add(Bidirectional(LSTM(64, return_sequences=False)))
model.add(Dropout(0.5))
model.add(Dense(64, activation="relu"))
model.add(Dropout(0.3))
model.add(Dense(1, activation="sigmoid"))

model.compile(loss="binary_crossentropy", optimizer="adam", metrics=["accuracy"])

model.summary()

# ======================
# 5. Train Model
# ======================
early_stop = EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)

history = model.fit(
    X_train_pad, y_train,
    validation_split=0.2,
    epochs=10,
    batch_size=64,
    callbacks=[early_stop],
    verbose=1
)

# ======================
# 6. Evaluate Model
# ======================
y_pred_prob = model.predict(X_test_pad)
y_pred = (y_pred_prob > 0.5).astype(int)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred, target_names=["Real", "Fake"]))

# ======================
# 7. Save Model & Tokenizer
# ======================
model.save(os.path.join("backend", "bilstm_model.h5"))
with open(os.path.join("backend", "tokenizer.pkl"), "wb") as f:
    pickle.dump(tokenizer, f)

print("✅ Bi-LSTM model & tokenizer saved in backend/")
