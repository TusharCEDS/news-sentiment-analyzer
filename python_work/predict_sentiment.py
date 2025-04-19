import pandas as pd
import joblib
import os

# ✅ Load trained model and vectorizer
models_dir = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\models"
model_path = os.path.join(models_dir, "logistic_regression_model.pkl")
vectorizer_path = os.path.join(models_dir, "count_vectorizer.pkl")

if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
    print("❌ Error: Model or Vectorizer file not found.")
    exit()

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

print("✅ Model and Vectorizer loaded successfully!")

# ✅ Load the new dataset for prediction
news_data_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_politics_cleaned.csv"  # Update category
news_data = pd.read_csv(news_data_path)

if "Cleaned_Description" not in news_data.columns:
    print("❌ Error: 'Cleaned_Description' column not found in the dataset.")
    exit()

# ✅ Transform news data using the same vectorizer
X_news = vectorizer.transform(news_data["Cleaned_Description"])

# ✅ Predict sentiment
news_data["Predicted_Sentiment"] = model.predict(X_news)

# ✅ Save results to a new CSV file
output_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_politics_predicted.csv"
news_data.to_csv(output_path, index=False)

print(f"✅ Predictions saved to: {output_path}")
