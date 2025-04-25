import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import '../assets/css/Reports.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    budgetAllocated: 0,
    totalExpense: 0,
    incomeGraphs: { 
      labels: [], 
      datasets: [{ 
        label: "Income", 
        data: [], 
        backgroundColor: "#00796b",
        borderColor: "#00796b",
        borderWidth: 1 
      }] 
    },
    incomeByDateGraphs: { 
      labels: [], 
      datasets: [{ 
        label: "Income by Date", 
        data: [], 
        backgroundColor: "#00796b",
        borderColor: "#00796b",
        borderWidth: 1
      }] 
    },
    budgetGraphs: {
      labels: [],
      datasets: [
        { 
          label: "Allocated", 
          data: [], 
          backgroundColor: "#233ce6",
          borderColor: "#233ce6",
          borderWidth: 1 
        },
        { 
          label: "Remaining", 
          data: [], 
          backgroundColor: "#333",
          borderColor: "#333",
          borderWidth: 1 
        },
      ],
    },
    expenseGraphs: { 
      labels: [], 
      datasets: [{ 
        label: "Expense by Category", 
        data: [], 
        backgroundColor: "#d32f2f",
        borderColor: "#d32f2f",
        borderWidth: 1 
      }] 
    },
    expenseByDateGraphs: { 
      labels: [], 
      datasets: [{ 
        label: "Expense by Date", 
        data: [], 
        backgroundColor: "#d32f2f",
        borderColor: "#d32f2f",
        borderWidth: 1
      }] 
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://mypocketai.onrender.com/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Report Data:", response.data);
        const {
          totalIncome,
          budgetAllocated,
          totalExpense,
          incomeGraphs,
          incomeByDateGraphs,
          budgetGraphs,
          expenseGraphs,
          expenseByDateGraphs,
        } = response.data;

        setReportData({
          totalIncome,
          budgetAllocated,
          totalExpense,
          incomeGraphs: {
            ...incomeGraphs,
            datasets: incomeGraphs.datasets.map((dataset, index) => ({
              ...dataset,
              backgroundColor: "#00796b",
              borderColor: "#00796b",
            })),
          },
          incomeByDateGraphs: {
            ...incomeByDateGraphs,
            datasets: incomeByDateGraphs.datasets.map((dataset, index) => ({
              ...dataset,
              backgroundColor: "#00796b",
              borderColor: "#00796b",
            })),
          },
          budgetGraphs: {
            ...budgetGraphs,
            datasets: budgetGraphs.datasets.map((dataset, index) => ({
              ...dataset,
              backgroundColor: index === 0 ? "#233ce6" : "#333",
              borderColor: index === 0 ? "#233ce6" : "#333",
            })),
          },
          expenseGraphs: {
            ...expenseGraphs,
            datasets: expenseGraphs.datasets.map((dataset) => ({
              ...dataset,
              backgroundColor: "#dc3545",
              borderColor: "#dc3545",
            })),
          },
          expenseByDateGraphs: {
            ...expenseByDateGraphs,
            datasets: expenseByDateGraphs.datasets.map((dataset) => ({
              ...dataset,
              backgroundColor: "#dc3545",
              borderColor: "#dc3545",
            })),
          },
        });
      } catch (err) {
        setError("Failed to load report data. Please try again later.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const graphOptions = {
    responsive: true,
    plugins: { title: { display: true, text: "" } },
    scales: { x: { beginAtZero: true }, y: { beginAtZero: true } },
  };

  if (loading) return <div>Loading report data...</div>;
  if (error) return <div>{error}</div>;

  const renderGraph = (data, title) => {
    if (!data.labels.length || !data.datasets.length) {
      return <div>No data available</div>;
    }
    return <Line data={data} options={{ ...graphOptions, plugins: { title: { text: title } } }} />;
  };

  return (
    <div className="report-container">
      <div className="report-summary">
        {["Total Income", "Budget Allocated", "Budget Remaining", "Total Expense", "Amount Left to Spend"].map(
          (label, index) => {
            const values = [
              reportData.totalIncome,
              reportData.budgetAllocated,
              reportData.totalIncome - reportData.budgetAllocated,
              reportData.totalExpense,
              reportData.totalIncome - reportData.totalExpense,
            ];

            // Fix the conditions
            const isIncome = label === "Total Income" || label === "Amount Left to Spend";
            const isExpense = label === "Total Expense";
            const isBudget = label === "Budget Allocated" || label === "Budget Remaining";

            return (
              <div className="summary-box" key={index}>
                <h3 style={{ color: isIncome ? '#00796b' : isExpense ? '#dc3545' : isBudget ? '#233ce6' : 'inherit' }}>
                  {label}
                </h3>
                <p>
                  {values[index]}
                </p>
              </div>
            );
          }
        )}
      </div>


      <div className="graphs-container">
        {["Income by Source", "Income by Date"].map((title, index) => (
          <div className="graph-box" key={index}>
            {renderGraph(index === 0 ? reportData.incomeGraphs : reportData.incomeByDateGraphs, title)}
          </div>
        ))}
      </div>

      <div className="graphs-container">
        {["Expense by Category", "Expense by Date"].map((title, index) => (
          <div className="graph-box" key={index}>
            {renderGraph(index === 0 ? reportData.expenseGraphs : reportData.expenseByDateGraphs, title)}
          </div>
        ))}
      </div>

      <div className="graphs-container">
        <div className="graph-box">
          {renderGraph(reportData.budgetGraphs, "Budget Allocation and Remaining")}
        </div>
      </div>
    </div>
  );
};

export default Reports;