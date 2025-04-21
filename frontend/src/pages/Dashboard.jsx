import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import BulkUpload from "../components/BulkUpload";

function Dashboard() {
  const { auth } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalMonthly: 0,
    totalAnnual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/subscriptions/",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setSubscriptions(response.data);

      const statsResponse = await axios.get(
        "http://localhost:8000/api/subscriptions/stats/",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/subscriptions/delete/${id}/`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      const updatedSubscriptions = subscriptions.filter((sub) => sub.id !== id);
      const monthlyTotal = updatedSubscriptions.reduce((sum, sub) => {
        const monthlyCost =
          sub.renewal_type === "monthly"
            ? parseFloat(sub.cost)
            : parseFloat(sub.cost) / 12;
        return sum + monthlyCost;
      }, 0);

      const annualTotal = updatedSubscriptions.reduce((sum, sub) => {
        const annualCost =
          sub.renewal_type === "yearly"
            ? parseFloat(sub.cost)
            : parseFloat(sub.cost) * 12;
        return sum + annualCost;
      }, 0);

      setStats({
        totalMonthly: monthlyTotal.toFixed(2),
        totalAnnual: annualTotal.toFixed(2),
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUpload(false);
    fetchSubscriptions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getChartData = () => {
    return subscriptions.map((sub) => ({
      name: sub.name,
      monthlyCost:
        sub.renewal_type === "monthly"
          ? parseFloat(sub.cost)
          : parseFloat(sub.cost) / 12,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-slate-200">
            Total Monthly Spend
          </h3>
          <p className="mt-2 text-3xl font-bold text-teal-400">
            ${stats.monthly_cost}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-slate-200">
            Total Annual Spend
          </h3>
          <p className="mt-2 text-3xl font-bold text-teal-400">
            ${stats.yearly_cost}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-slate-200">
            Active Subscriptions
          </h3>
          <p className="mt-2 text-3xl font-bold text-teal-400">
            {subscriptions.length}
          </p>
        </div>
      </div>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-slate-200 mb-4">
          Monthly Cost Breakdown
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#CBD5E1" />
              <YAxis stroke="#CBD5E1" />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.3)" }}
                formatter={(value) => [`$${value.toFixed(2)}`, "Monthly Cost"]}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  color: "#E2E8F0",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  padding: "12px",
                }}
                labelStyle={{
                  color: "#5EEAD4",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
                itemStyle={{ color: "#CBD5E1" }}
              />
              <Bar
                dataKey="monthlyCost"
                fill="#5EEAD4"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showBulkUpload ? (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-200">
              Bulk Upload Subscriptions
            </h3>
            <button
              onClick={() => setShowBulkUpload(false)}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Subscriptions
            </button>
          </div>
          <BulkUpload onUploadSuccess={handleBulkUploadSuccess} />
        </div>
      ) : (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-200">
              Your Subscriptions
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition duration-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Bulk Upload
              </button>
              <Link
                to="/add"
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition duration-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New
              </Link>
            </div>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>You don't have any subscriptions yet.</p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link
                  to="/add"
                  className="text-teal-400 hover:text-teal-300 transition duration-200"
                >
                  Add your first subscription
                </Link>
                <span className="text-slate-600">or</span>
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="text-teal-400 hover:text-teal-300 transition duration-200"
                >
                  Import from CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Billing Cycle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Next Renewal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {subscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="hover:bg-slate-700 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-200">
                          {subscription.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          ${subscription.cost} / {subscription.renewal_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {subscription.renewal_type === "monthly"
                            ? "Monthly"
                            : "Yearly"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            subscription.renewing_in_7_days
                              ? "text-rose-400 font-bold"
                              : "text-slate-300"
                          }`}
                        >
                          {formatDate(subscription.renewal_date)}
                          {subscription.renewing_in_7_days && (
                            <span className="ml-2 text-xs bg-rose-900 text-rose-200 px-2 py-1 rounded">
                              Soon!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="text-rose-400 hover:text-rose-300 transition duration-200"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-slate-200 mb-4">
          Potential Savings
        </h3>
        <div className="space-y-4">
          {subscriptions
            .filter((sub) => sub.renewal_type === "monthly")
            .map((sub) => {
              const monthlyCost = parseFloat(sub.cost);
              const yearlyCost = monthlyCost * 12;
              const yearlyDiscount = yearlyCost * 0.1;
              const potentialYearlyCost = yearlyCost - yearlyDiscount;
              const savings = yearlyCost - potentialYearlyCost;

              return (
                <div
                  key={sub.id}
                  className="bg-slate-700 p-4 rounded border-l-4 border-teal-400"
                >
                  <p className="text-slate-200">
                    <span className="font-semibold">{sub.name}:</span> If you
                    switch from Monthly to Annual, you'll save{" "}
                    <span className="text-teal-300 font-bold">
                      ${savings.toFixed(2)}/year
                    </span>
                  </p>
                </div>
              );
            })}

          {subscriptions.filter((sub) => sub.renewal_type === "monthly")
            .length === 0 && (
            <p className="text-slate-400">No monthly subscriptions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;