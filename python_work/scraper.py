import requests
import os
import csv
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()
API_KEY = os.getenv("NEWS_API_KEY")  # (If you need it later for other APIs)

# Ask user for category
category = input("Enter news category (e.g., technology, sports, business, health): ").strip().lower()

# Define pagination
page = 1
page_size = 10  # Max allowed by your API
all_articles = []

while True:
    print(f"📡 Fetching page {page}...")
    URL = f"https://news-aggregator-dusky.vercel.app/top-headlines?language=en&category={category}&page={page}&pageSize={page_size}"
    response = requests.get(URL)

    try:
        response_json = response.json()
    except ValueError:
        print("❌ Failed to parse JSON. Skipping this page.")
        break

    # Check if response has data
    if not response_json.get("success") or "data" not in response_json or "articles" not in response_json["data"]:
        print(f"❌ No data found on page {page}. Stopping.")
        break

    articles = response_json["data"]["articles"]
    if not articles:
        print(f"✅ No more articles found on page {page}. Done fetching.")
        break

    all_articles.extend(articles)
    page += 1
    time.sleep(0.5)  # Avoid overloading the API (optional)

# Ensure we got some articles
if not all_articles:
    print("⚠️ No articles collected.")
    exit()

# Save all articles to CSV
file_path = f"news-aggregator/python_work/data/news_{category}.csv"
os.makedirs(os.path.dirname(file_path), exist_ok=True)

with open(file_path, "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Title", "Author", "Source", "Published At", "URL", "Description"])

    for article in all_articles:
        writer.writerow([
            article.get("title", "N/A"),
            article.get("author", "N/A"),
            article["source"].get("name", "N/A") if article.get("source") else "N/A",
            article.get("publishedAt", "N/A"),
            article.get("url", "N/A"),
            article.get("description", "N/A")
        ])

print(f"✅ Fetched and saved {len(all_articles)} articles to {file_path}")
