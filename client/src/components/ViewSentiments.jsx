import React, { useState, useEffect } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import '../ViewSentiments.css';

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ViewSentiments() {
  const [category, setCategory] = useState("");
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const availableCategories = [
    "business", "entertainment", "general", "health",
    "science", "sports", "technology", "politics",
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

  // Filter articles by sentiment
  const filterArticles = () => {
    if (!sentimentData) return [];
    if (filter === "all") return sentimentData.articles;
    return sentimentData.articles.filter(
      (article) => article.Predicted_Sentiment?.toLowerCase() === filter
    );
  };

  // Calculate percentage breakdown for Doughnut Percentage display
  const getPercentageData = () => {
    if (!sentimentData) return { positive: 0, neutral: 0, negative: 0 };
    const total = sentimentData.positive_count + sentimentData.neutral_count + sentimentData.negative_count;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0 };

    return {
      positive: ((sentimentData.positive_count / total) * 100).toFixed(1),
      neutral: ((sentimentData.neutral_count / total) * 100).toFixed(1),
      negative: ((sentimentData.negative_count / total) * 100).toFixed(1),
    };
  };

  // Calculate average sentiment score: +1 for positive, 0 for neutral, -1 for negative
  const calculateAverageSentiment = () => {
    if (!sentimentData || sentimentData.articles.length === 0) return 0;
    const scores = sentimentData.articles.map(article => {
      const s = article.Predicted_Sentiment?.toLowerCase();
      if (s === "positive") return 1;
      if (s === "neutral") return 0;
      if (s === "negative") return -1;
      return 0;
    });
    const avg = scores.reduce((acc, val) => acc + val, 0) / scores.length;
    return avg.toFixed(2);
  };

  // Prepare data for sentiment trend over time (group by day)
  const getSentimentTrendData = () => {
    if (!sentimentData) return null;
    const articles = sentimentData.articles;

    // Group by date (YYYY-MM-DD)
    const grouped = {};
    articles.forEach(article => {
      // Ensure PublishedAt exists, fallback to today's date if missing
      const dateRaw = article.PublishedAt || article.publishedAt || new Date().toISOString();
      const date = new Date(dateRaw).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { positive: 0, neutral: 0, negative: 0 };
      }
      const s = article.Predicted_Sentiment?.toLowerCase();
      if (s === "positive") grouped[date].positive++;
      else if (s === "neutral") grouped[date].neutral++;
      else if (s === "negative") grouped[date].negative++;
    });

    const labels = Object.keys(grouped).sort();
    const positiveData = labels.map(date => grouped[date].positive);
    const neutralData = labels.map(date => grouped[date].neutral);
    const negativeData = labels.map(date => grouped[date].negative);

    return {
      labels,
      datasets: [
        {
          label: "Positive",
          data: positiveData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Neutral",
          data: neutralData,
          borderColor: "#FFC107",
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Negative",
          data: negativeData,
          borderColor: "#F44336",
          backgroundColor: "rgba(244, 67, 54, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  const sentimentTrendData = getSentimentTrendData();
  const percentageData = getPercentageData();
  const avgSentiment = calculateAverageSentiment();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-700 mt-24">
        Sentiment Analysis Dashboard
      </h2>

      <div className="mb-6 text-center">
        <label className="font-semibold mr-2 text-lg">Select Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded-lg w-60 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a category --</option>
          {availableCategories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {category && (
        <div className="text-center mb-6">
          <span className="mr-4 font-semibold text-gray-700">Filter Articles:</span>
          {["all", "positive", "neutral", "negative"].map((option) => (
            <label key={option} className="mr-4 capitalize text-lg">
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
        <>
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Sentiment Distribution for "{category}"
          </h3>

          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {/* Doughnut Chart */}
            <div className="w-full sm:w-1/3 max-w-md bg-white rounded-xl shadow p-6">
              <Doughnut
                data={{
                  labels: ["Positive", "Neutral", "Negative"],
                  datasets: [{
                    data: [
                      sentimentData.positive_count,
                      sentimentData.neutral_count,
                      sentimentData.negative_count,
                    ],
                    backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Sentiment Distribution (Doughnut Chart)" },
                  },
                }}
              />
              <div className="mt-4 text-center text-lg font-semibold">
                Percentages: Positive {percentageData.positive}%, Neutral {percentageData.neutral}%, Negative {percentageData.negative}%
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="w-full sm:w-1/3 max-w-md bg-white rounded-xl shadow p-6">
              <Bar
                data={{
                  labels: ["Positive", "Neutral", "Negative"],
                  datasets: [{
                    label: "Number of Articles",
                    data: [
                      sentimentData.positive_count,
                      sentimentData.neutral_count,
                      sentimentData.negative_count,
                    ],
                    backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
                  }],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Sentiment Distribution (Horizontal Bar)" },
                  },
                }}
              />
              <div className="mt-4 text-center text-lg font-semibold">
                Average Sentiment Score: {avgSentiment} (1=Positive, 0=Neutral, -1=Negative)
              </div>
            </div>

            {/* Sentiment Trend Line Chart */}
            <div className="w-full sm:w-1/3 max-w-md bg-white rounded-xl shadow p-6">
              <Line
                data={sentimentTrendData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Sentiment Trend Over Time" },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: "Date" },
                    },
                    y: {
                      title: { display: true, text: "Number of Articles" },
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Articles List */}
          <div className="mt-8">
            <h4 className="text-2xl font-semibold mb-4 text-gray-700">News Articles</h4>
            {filterArticles().length === 0 ? (
              <p className="text-gray-500">No articles match the selected filter.</p>
            ) : (
              filterArticles().map((article, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
                >
                  <h5 className="font-semibold text-xl mb-1">{article.Title || "Untitled"}</h5>
                  <p className="text-gray-700 mb-1">
                    {article.Description || "No description available."}
                  </p>
                  <p className="mb-2">
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
                      className="text-blue-600 underline font-medium"
                    >
                      View Full Article
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ViewSentiments;
