import pandas as pd

# Load the dataset
file_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_with_sentiment.csv"
data = pd.read_csv(file_path)

# Check if the column exists before deleting
if "Predicted_Sentiment" in data.columns:
    data.drop(columns=["Predicted_Sentiment"], inplace=True)
    print("✅ 'Predicted_Sentiment' column deleted successfully!")

# Save the cleaned dataset
data.to_csv(file_path, index=False)
print(f"✅ Updated dataset saved at: {file_path}")
