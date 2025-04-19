import pandas as pd
import numpy as np
import os
import joblib
import re
import nltk
from collections import Counter
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# ✅ ML Libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier  # ✅ XGBoost
from imblearn.over_sampling import SMOTE  # ✅ Handling class imbalance

# ✅ Download necessary NLTK data (Only needed once)
nltk.download("wordnet")
nltk.download("stopwords")

# ✅ Text Preprocessing Function
def preprocess_text(text):
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words("english"))

    text = text.lower().strip()  # Convert to lowercase & remove extra spaces
    text = re.sub(r"[^a-zA-Z\s]", "", text)  # Remove punctuation
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(words)

# ✅ Load the dataset
dataset_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\final_dataset.csv"
data = pd.read_csv(dataset_path)

# ✅ Drop missing values
data.dropna(subset=["Headlines", "sentiment_label"], inplace=True)

# ✅ Encode labels as numerical values
label_mapping = {"Negative": 0, "Neutral": 1, "Positive": 2}
data["sentiment_label"] = data["sentiment_label"].map(label_mapping)

# ✅ Apply Text Preprocessing
data["Headlines"] = data["Headlines"].apply(preprocess_text)

# ✅ Initialize TF-IDF Vectorizer
tfidf = TfidfVectorizer(
    max_features=20000,  
    ngram_range=(1, 2),  
    stop_words="english",  
    sublinear_tf=True,  
    min_df=3,  
    max_df=0.9  
)

X = tfidf.fit_transform(data["Headlines"])  
y = data["sentiment_label"]  

# ✅ Handle Class Imbalance using SMOTE
smote = SMOTE(sampling_strategy="auto", random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# ✅ Split into train & test sets
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, stratify=y_resampled, random_state=42)

# ✅ Train Optimized XGBoost Model
xgb = XGBClassifier(
    n_estimators=300,  # Reduced to prevent overfitting
    max_depth=6,  # Shallower trees for better generalization
    learning_rate=0.05,  # Lower LR for stability
    subsample=0.7,  
    colsample_bytree=0.7,  
    reg_lambda=1,  # L2 Regularization
    reg_alpha=0.5,  # L1 Regularization
    objective="multi:softmax",  
    num_class=3,  
    random_state=42
)

xgb.fit(X_train, y_train)

# ✅ Predictions
y_pred_train = xgb.predict(X_train)
y_pred_test = xgb.predict(X_test)

# ✅ Accuracy & Classification Report
print(f"✅ Train Accuracy: {accuracy_score(y_train, y_pred_train):.4f}")
print(f"✅ Test Accuracy: {accuracy_score(y_test, y_pred_test):.4f}")
print("\n🔹 Classification Report:\n", classification_report(y_test, y_pred_test, target_names=["Negative", "Neutral", "Positive"]))

# ✅ Save model & vectorizer
models_dir = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\models"
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, "xgboost_model.pkl")
vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")

joblib.dump(xgb, model_path)
joblib.dump(tfidf, vectorizer_path)

print(f"✅ XGBoost Model saved at: {model_path}")
print(f"✅ Vectorizer saved at: {vectorizer_path}")
