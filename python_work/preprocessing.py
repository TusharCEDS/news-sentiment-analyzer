import pandas as pd
import matplotlib.pyplot as plt
import re
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from nltk.stem import WordNetLemmatizer
import contractions
from collections import Counter

# Download required NLTK resources
nltk.download("stopwords")
nltk.download("wordnet")

# Define column names
columns = ["Title", "Author", "Source", "Published At", "URL", "Description"]

# Ask user for category
category = input("Enter the category to be analyzed: ").strip().lower()

# Load CSV file
file_path = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}.csv"
data = pd.read_csv(file_path, names=columns, encoding="latin1", skiprows=1)  # Skip header row

# Keep only relevant columns
data = data[["Title", "Description"]]

# Check for missing values
data["Description"] = data["Description"].fillna("No Description Provided")  # Avoid empty strings

# Initialize stopwords and lemmatizer
nltk_stopwords = set(stopwords.words("english"))
sklearn_stopwords = set(ENGLISH_STOP_WORDS)

# Custom stopwords (avoid words that could be important)
custom_stopwords = {"com", "follow", "website", "http", "www"}
final_stopwords = nltk_stopwords.union(sklearn_stopwords).difference({"not", "no", "never"}).union(custom_stopwords)

lemmatizer = WordNetLemmatizer()

# Function to clean text
def clean_text(text):
    text = contractions.fix(text)  # Expand contractions
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)  # Remove URLs
    text = re.sub(r"@\w+", "", text)  # Remove mentions
    text = re.sub(r"#\w+", "", text)  # Remove hashtags
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation except word characters
    text = text.lower().strip()  # Convert to lowercase
    cleaned_text = " ".join(
        [lemmatizer.lemmatize(word) for word in text.split() if word not in final_stopwords]
    )
    return cleaned_text

# Apply preprocessing
data["Cleaned_Description"] = data["Description"].apply(clean_text)

# Save cleaned data
cleaned_file_path = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}_cleaned.csv"
data.to_csv(cleaned_file_path, index=False, encoding="utf-8")

print(f"✅ Cleaned descriptions saved to {cleaned_file_path}")

# Frequency analysis
all_words = [word for desc in data["Cleaned_Description"] for word in desc.split()]
unique_words_count = len(set(all_words))
print(f"📊 Total unique words: {unique_words_count}")

# Plot word frequency before & after cleaning
plt.figure(figsize=(12, 5))
plt.title(f"Top 25 Most Common Words in {category} News (After Cleaning)")
plt.xticks(rotation=45, fontsize=12)
plt.bar(*zip(*Counter(all_words).most_common(25)))
plt.show()
