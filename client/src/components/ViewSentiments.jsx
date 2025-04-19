import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ViewSentiments() {
  const [category, setCategory] = useState("");
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const availableCategories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
    "politics",
  ];

  const fetchSentimentData = async () => {
    if (!category) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/sentiment/${category}`);
      if (!response.ok) throw new Error("Failed to fetch sentiment data");

      const data = await response.json();
      const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };

      data.forEach((article) => {
        const sentiment = article.Predicted_Sentiment?.toLowerCase();
        if (sentiment === "positive") sentimentCounts.Positive += 1;
        else if (sentiment === "neutral") sentimentCounts.Neutral += 1;
        else if (sentiment === "negative") sentimentCounts.Negative += 1;
      });

      setSentimentData({
        positive_count: sentimentCounts.Positive,
        neutral_count: sentimentCounts.Neutral,
        negative_count: sentimentCounts.Negative,
        articles: data,
      });
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (category) {
      fetchSentimentData();
    }
  }, [category]);

  const filterArticles = () => {
    if (!sentimentData) return [];
    if (filter === "all") return sentimentData.articles;

    return sentimentData.articles.filter(
      (article) => article.Predicted_Sentiment?.toLowerCase() === filter
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 mt-24">
        Sentiment Analysis Dashboard
      </h2>

      {/* Category Dropdown */}
      <div className="mb-6 text-center">
        <label className="font-semibold mr-2 text-lg">Select Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded-lg w-60 text-lg"
        >
          <option value="">-- Choose a category --</option>
          {availableCategories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Debug Info (Optional) */}
      {category && (
        <p className="text-center text-sm text-gray-500 mb-2">
          Selected Category: <strong>{category}</strong> | Filter: <strong>{filter}</strong>
        </p>
      )}

      {/* Filter Options */}
      {category && (
        <div className="text-center mb-6">
          <span className="mr-4 font-semibold text-gray-700">Filter Articles:</span>
          {["all", "positive", "neutral", "negative"].map((option) => (
            <label key={option} className="mr-4 capitalize">
              <input
                type="radio"
                value={option}
                checked={filter === option}
                onChange={(e) => setFilter(e.target.value)}
                className="mr-1"
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-blue-600 font-semibold text-center mb-4">Loading sentiment data...</p>
      )}

      {sentimentData && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Sentiment Distribution for "{category}"
          </h3>

          {/* Charts */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="w-full sm:w-1/2 max-w-md bg-white rounded-xl shadow p-4">
              <Pie
                data={{
                  labels: ["Positive", "Neutral", "Negative"],
                  datasets: [
                    {
                      data: [
                        sentimentData.positive_count,
                        sentimentData.neutral_count,
                        sentimentData.negative_count,
                      ],
                      backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Sentiment Distribution (Pie Chart)" },
                  },
                }}
              />
            </div>

            <div className="w-full sm:w-1/2 max-w-md bg-white rounded-xl shadow p-4">
              <Bar
                data={{
                  labels: ["Positive", "Neutral", "Negative"],
                  datasets: [
                    {
                      label: "Number of Articles",
                      data: [
                        sentimentData.positive_count,
                        sentimentData.neutral_count,
                        sentimentData.negative_count,
                      ],
                      backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Sentiment Distribution (Bar Chart)" },
                  },
                }}
              />
            </div>
          </div>

          {/* Articles List */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-700">News Articles</h4>
            {filterArticles().length === 0 ? (
              <p className="text-gray-500">No articles match the selected filter.</p>
            ) : (
              filterArticles().map((article, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 border rounded-lg shadow-sm bg-white transition hover:shadow-md"
                >
                  <h5 className="font-semibold text-lg">{article.Title || "Untitled"}</h5>
                  <p className="mb-1 text-gray-700">
                    {article.Description || "No description available."}
                  </p>
                  <p className="mb-1">
                    <strong>Sentiment:</strong>{" "}
                    <span
                      className={
                        article.Predicted_Sentiment?.toLowerCase() === "positive"
                          ? "text-green-600 font-semibold"
                          : article.Predicted_Sentiment?.toLowerCase() === "negative"
                          ? "text-red-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {article.Predicted_Sentiment || "Unknown"}
                    </span>
                  </p>
                  {article.URL && (
                    <a
                      href={article.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Full Article
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewSentiments;
