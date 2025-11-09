# import pandas as pd
# import numpy as np
# import pickle
# import tensorflow as tf
# from tensorflow.keras.models import Sequential, load_model
# from tensorflow.keras.layers import Embedding, LSTM, Dense
# from tensorflow.keras.preprocessing.text import Tokenizer
# from tensorflow.keras.preprocessing.sequence import pad_sequences

# from sklearn.utils import class_weight


# # ======================
# # 1. Load LIAR dataset
# # ======================
# train_df = pd.read_csv("data/liar_dataset/train.tsv", sep="\t", header=None)
# valid_df = pd.read_csv("data/liar_dataset/valid.tsv", sep="\t", header=None)
# test_df  = pd.read_csv("data/liar_dataset/test.tsv",  sep="\t", header=None)

# # ======================
# # 2. Extract Texts & Labels
# # ======================
# train_texts = train_df[2].astype(str).tolist()  # col 2 = statements
# train_labels = train_df[1].tolist()             # col 1 = labels

# valid_texts = valid_df[2].astype(str).tolist()
# valid_labels = valid_df[1].tolist()

# test_texts = test_df[2].astype(str).tolist()
# test_labels = test_df[1].tolist()

# # ======================
# # 3. Convert multi-class → binary
# # ======================
# def to_binary(label):
#     if label in ["true", "mostly-true", "half-true"]:
#         return 1  # Real
#     else:
#         return 0  # Fake

# train_labels = [to_binary(l) for l in train_labels]
# valid_labels = [to_binary(l) for l in valid_labels]
# test_labels  = [to_binary(l) for l in test_labels]

# # ======================
# # 4. Tokenization
# # ======================
# tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
# tokenizer.fit_on_texts(train_texts)

# train_seq = pad_sequences(tokenizer.texts_to_sequences(train_texts), maxlen=300)
# valid_seq = pad_sequences(tokenizer.texts_to_sequences(valid_texts), maxlen=300)
# test_seq  = pad_sequences(tokenizer.texts_to_sequences(test_texts),  maxlen=300)

# # Convert labels to numpy arrays
# train_labels = np.array(train_labels, dtype="float32")
# valid_labels = np.array(valid_labels, dtype="float32")
# test_labels  = np.array(test_labels,  dtype="float32")

# class_weights = class_weight.compute_class_weight(
#     class_weight="balanced",
#     classes=np.unique(train_labels),
#     y=train_labels
# )
# class_weights = dict(enumerate(class_weights))
# print("Class Weights:", class_weights)

# # Save tokenizer
# with open("models/tokenizer.pkl", "wb") as f:
#     pickle.dump(tokenizer, f)

# # ======================
# # 5. Build LSTM Model
# # ======================
# model = Sequential([
#     Embedding(input_dim=5000, output_dim=64, input_length=300),
#     LSTM(128, dropout=0.2, recurrent_dropout=0.2),
#     Dense(1, activation="sigmoid")
# ])

# model.compile(loss="binary_crossentropy", optimizer="adam", metrics=["accuracy"])

# # ======================
# # 6. Train
# # ======================
# model.fit(train_seq, train_labels,
#           validation_data=(valid_seq, valid_labels),
#           epochs=15, batch_size=64,
#           class_weight=class_weights)

# # ======================
# # 7. Save Model
# # ======================
# model.save("models/lstm_model.h5")
# print("✅ Model trained & saved at models/lstm_model.h5")

# # ======================
# # 8. Evaluate on Test Set
# # ======================
# loss, acc = model.evaluate(test_seq, test_labels, verbose=0)
# print(f"📊 Test Accuracy: {acc*100:.2f}%")




import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Load data
df = pd.read_csv("../dataset/final_dataset.csv")
X = df['text'].astype(str).values
y = df['label'].values

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Tokenize
tokenizer = Tokenizer(num_words=30000)
tokenizer.fit_on_texts(X_train)
X_train_seq = tokenizer.texts_to_sequences(X_train)
X_test_seq = tokenizer.texts_to_sequences(X_test)

max_len = 200
X_train_pad = pad_sequences(X_train_seq, maxlen=max_len)
X_test_pad = pad_sequences(X_test_seq, maxlen=max_len)

# Model
model = Sequential()
model.add(Embedding(30000, 128, input_length=max_len))
model.add(LSTM(128, dropout=0.2, recurrent_dropout=0.2))
model.add(Dense(1, activation='sigmoid'))

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

# Callbacks
es = EarlyStopping(monitor='val_loss', patience=2, restore_best_weights=True)
mc = ModelCheckpoint('ai-model/lstm_model.h5', monitor='val_accuracy', save_best_only=True)

# Train
model.fit(X_train_pad, y_train, validation_data=(X_test_pad, y_test), epochs=5, batch_size=64, callbacks=[es, mc])

# Save tokenizer
import joblib
joblib.dump(tokenizer, 'ai-model/lstm_tokenizer.pkl')
