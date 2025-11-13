import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GithubActivity = () => {
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({
    PushEvent: 0,
    PullRequestEvent: 0,
    CreateEvent: 0,
  });
  const [filter, setFilter] = useState("all");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // 🧭 Extract username from URL (set by backend redirect)
    const params = new URLSearchParams(window.location.search);
    const user = params.get("username");
    if (user) {
      setUsername(user);
      fetchActivity(user);
    }
  }, []);

  const fetchActivity = async (user, type = "") => {
    try {
      const url = type
        ? `http://localhost:5001/api/github/activity/${user}?type=${type}`
        : `http://localhost:5001/api/github/activity/${user}`;

      const response = await axios.get(url);
      setActivity(response.data);

      // 🧮 Calculate stats if fetching all
      if (!type) {
        const counts = { PushEvent: 0, PullRequestEvent: 0, CreateEvent: 0 };
        response.data.forEach((e) => {
          if (counts[e.activityType] !== undefined) counts[e.activityType]++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error("Activity Fetch Error:", err);
    }
  };

  const handleFilter = (type) => {
    setFilter(type);
    if (type === "all") fetchActivity(username);
    else fetchActivity(username, type);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🚀 GitHub Activity Dashboard
      </h1>

      {username && (
        <p className="text-center text-gray-600 mb-4">
          Viewing activity for <b>{username}</b>
        </p>
      )}

      {/* 🔹 Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => handleFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilter("PushEvent")}
          className={`px-4 py-2 rounded-lg ${
            filter === "PushEvent" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Commits
        </button>
        <button
          onClick={() => handleFilter("PullRequestEvent")}
          className={`px-4 py-2 rounded-lg ${
            filter === "PullRequestEvent" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Pull Requests
        </button>
        <button
          onClick={() => handleFilter("CreateEvent")}
          className={`px-4 py-2 rounded-lg ${
            filter === "CreateEvent" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Repo Creations
        </button>
      </div>

      {/* 🧮 Stats Summary */}
      <div className="grid grid-cols-3 gap-6 text-center mb-8">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Commits</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.PushEvent}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">PRs</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.PullRequestEvent}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Repos</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.CreateEvent}</p>
        </div>
      </div>
        {/* 📈 Activity Chart */}
    <div className="bg-white p-6 rounded-2xl shadow mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        GitHub Activity Trend
    </h2>

    {activity.length === 0 ? (
        <p className="text-center text-gray-500">
        No data available for chart.
        </p>
    ) : (
        <ResponsiveContainer width="100%" height={300}>
        <LineChart
            data={activity.reduce((acc, cur) => {
            const date = new Date(cur.timestamp).toLocaleDateString();
            let day = acc.find((d) => d.date === date);
            if (!day) {
                day = { date, PushEvent: 0, PullRequestEvent: 0, CreateEvent: 0 };
                acc.push(day);
            }
            day[cur.activityType]++;
            return acc;
            }, [])}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
            type="monotone"
            dataKey="PushEvent"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Commits"
            />
            <Line
            type="monotone"
            dataKey="PullRequestEvent"
            stroke="#10b981"
            strokeWidth={2}
            name="Pull Requests"
            />
            <Line
            type="monotone"
            dataKey="CreateEvent"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Repo Creations"
            />
        </LineChart>
        </ResponsiveContainer>
    )}
    </div>


      {/* 🕒 Activity Feed */}
      <div className="space-y-4">
        {activity.length === 0 ? (
          <p className="text-center text-gray-500">
            No recent activity found. Try syncing from backend.
          </p>
        ) : (
          activity.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="text-gray-800">
                <span className="font-semibold">{username}</span>{" "}
                {item.activityType === "PushEvent" && "pushed to"}{" "}
                {item.activityType === "PullRequestEvent" && "opened PR on"}{" "}
                {item.activityType === "CreateEvent" && "created repo"}{" "}
                <b>{item.repoName}</b>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GithubActivity;
