import pandas as pd
import numpy as np
import os
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# -------------------- Step 1: Load & Preprocess Training Data --------------------

# Define dataset path
dataset_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\final_dataset.csv"
data = pd.read_csv(dataset_path)

# Drop missing values in required columns
data = data.dropna(subset=["Headlines", "sentiment_label"])

# Initialize CountVectorizer
CV = CountVectorizer()
X = CV.fit_transform(data["Headlines"])  # Using "Headlines" as input
y = data["sentiment_label"]  # Using "sentiment_label" as target

# Split into train & test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)

# -------------------- Step 2: Train Model --------------------

# Train Logistic Regression Model
LR = LogisticRegression(solver='liblinear', class_weight='balanced', penalty='l1', C=0.4)
LR.fit(X_train, y_train)

# Accuracy Scores
print(f"✅ Train Accuracy: {LR.score(X_train, y_train)}")
print(f"✅ Test Accuracy: {LR.score(X_test, y_test)}")

# -------------------- Step 3: Save Model & Vectorizer --------------------

# Define model save path
models_dir = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\models"
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, "logistic_regression_model.pkl")
vectorizer_path = os.path.join(models_dir, "count_vectorizer.pkl")

joblib.dump(LR, model_path)
joblib.dump(CV, vectorizer_path)

print(f"✅ Model saved at: {model_path}")
print(f"✅ Vectorizer saved at: {vectorizer_path}")

# -------------------- Step 4: Predict Sentiments for User-Selected Category --------------------

# Ask user for news category
category = input("🔹 Enter the news category (e.g., politics, sports, business, technology): ").strip().lower()
news_data_path = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}_cleaned.csv"

# Check if file exists
if not os.path.exists(news_data_path):
    print(f"❌ Error: File {news_data_path} not found.")
    exit()

# Load the news data
news_data = pd.read_csv(news_data_path)

# Ensure 'Cleaned_Description' exists
if "Cleaned_Description" not in news_data.columns:
    print("❌ Error: 'Cleaned_Description' column not found in the dataset.")
    exit()

# 🔥 FIX: Replace NaN values with empty strings to avoid errors
news_data["Cleaned_Description"] = news_data["Cleaned_Description"].fillna("")

# Transform news data using the trained vectorizer
X_news = CV.transform(news_data["Cleaned_Description"])

# Predict sentiments
predicted_sentiments = LR.predict(X_news)

# Add predictions to dataframe
news_data["Predicted_Sentiment"] = predicted_sentiments

# Save predictions
predicted_file_path = f"C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_{category}_predicted.csv"
news_data.to_csv(predicted_file_path, index=False)

print(f"✅ Predictions saved to: {predicted_file_path}")
