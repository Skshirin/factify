import pandas as pd

# Load IFND.csv
ifnd_df = pd.read_csv('IFND.csv', encoding='ISO-8859-1')
ifnd_df = ifnd_df.rename(columns={'Statement': 'text', 'Label': 'label'})
ifnd_df = ifnd_df[['text', 'label']]
# Normalize label: fake = 1, else = 0
ifnd_df['label'] = ifnd_df['label'].astype(str).str.lower().map({'fake': 1, 'true': 0, '1': 1, '0': 0})

# Load fake_and_real_news.csv
indian_df = pd.read_csv('fake_and_real_news.csv', encoding='ISO-8859-1')
indian_df = indian_df.rename(columns={'Text': 'text', 'label': 'label'})
indian_df = indian_df[['text', 'label']]
# Normalize label to 0/1
indian_df['label'] = indian_df['label'].astype(str).str.lower().map({'fake': 1, 'true': 0, '1': 1, '0': 0})

# Load FAKE.csv – assign label = 1
fake_df = pd.read_csv('FAKE.csv', encoding='ISO-8859-1')
fake_df['label'] = 1
fake_df = fake_df.rename(columns={'text': 'text'})  # make sure it's correct
if 'text' not in fake_df.columns:
    fake_df['text'] = fake_df['title']  # fallback to title if text missing
fake_df = fake_df[['text', 'label']]

# Load TRUE.csv – assign label = 0
true_df = pd.read_csv('TRUE.csv', encoding='ISO-8859-1')
true_df['label'] = 0
true_df = true_df.rename(columns={'text': 'text'})
if 'text' not in true_df.columns:
    true_df['text'] = true_df['title']
true_df = true_df[['text', 'label']]

# Merge all
combined_df = pd.concat([ifnd_df, indian_df, fake_df, true_df], ignore_index=True)

# Drop NaNs and shuffle
combined_df.dropna(inplace=True)
combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)

# Save to file
combined_df.to_csv('final_dataset.csv', index=False)

print("✅ All datasets cleaned, merged, and saved to final_dataset.csv")
