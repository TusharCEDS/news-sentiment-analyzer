import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Get category input
category = input("Enter the category to be analyzed: ").strip().lower()

# Load cleaned data
cleaned_file_path = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}_cleaned.csv"
data = pd.read_csv(cleaned_file_path)

# Ensure column exists & drop missing values
data = data.dropna(subset=["Cleaned_Description"])

# Initialize TF-IDF Vectorizer
tfidf = TfidfVectorizer(
    max_features=5000,  # Limit to 5000 most important words
    ngram_range=(1, 2),  # Include unigrams & bigrams for context
    stop_words=None,  # Stopwords already removed in preprocessing
)

# Transform text data
tfidf_features = tfidf.fit_transform(data["Cleaned_Description"])

# Convert to DataFrame
df = pd.DataFrame(tfidf_features.todense(), columns=tfidf.get_feature_names_out())

# Save extracted features
feature_file = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}_features.csv"
df.to_csv(feature_file, index=False)

print(f"✅ Feature extraction completed and saved at: {feature_file}")

# Print details
print(f"🔹 Total unique words in vocabulary: {len(tfidf.get_feature_names_out())}")
print(f"🔹 Shape of Document-Term Matrix: {tfidf_features.shape}")
