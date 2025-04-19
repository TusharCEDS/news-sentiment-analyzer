import pandas as pd

# Load the dataset
dataset_path = "C:\\Users\\aashu\\Desktop\\NEWS\\news-aggregator\\python_work\\data\\news_politics_predicted.csv"
data = pd.read_csv(dataset_path)

# Count occurrences of each sentiment
sentiment_counts = data["Predicted_Sentiment"].value_counts()

# Calculate percentage
sentiment_percentage = (sentiment_counts / len(data)) * 100

# Print the results
print(sentiment_percentage)
