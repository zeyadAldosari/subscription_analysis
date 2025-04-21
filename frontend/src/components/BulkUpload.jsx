import { useState, useContext, useRef } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function BulkUpload({ onUploadSuccess }) {
  const { auth } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/subscriptions/bulk_upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);

      if (response.status === 200 || response.status === 201) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }
    } catch (err) {
      setLoading(false);

      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(
            "Failed to upload CSV. Please check the format and try again."
          );
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h3 className="text-xl font-bold text-slate-200 mb-4">
        Bulk <span className="text-teal-400">Upload</span>
      </h3>

      <div className="mb-6 text-slate-300 text-sm">
        <p>Upload a CSV file to import multiple subscriptions at once.</p>
        <p className="mt-2">
          The CSV file must include these columns:
          <span className="text-teal-400 font-mono ml-1">
            name, cost, subscription_date, renewal_type
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-900/50 border border-rose-700 text-rose-200 rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-rose-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-slate-300">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-slate-400">CSV file only</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {file && (
          <div className="mt-3 text-sm text-slate-300">
            Selected file: <span className="font-medium">{file.name}</span> (
            {(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="px-6 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload CSV"
          )}
        </button>
        {file && (
          <button
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-md font-medium text-slate-300 mb-2">
          CSV Format Example:
        </h4>
        <div className="bg-slate-700 p-3 rounded-md">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
            name,cost,subscription_date,renewal_type
            <br />
            Netflix,15.99,2025-06-15,monthly
            <br />
            Spotify,9.99,2025-02-01,yearly
            <br />
          </pre>
        </div>
      </div>
    </div>
  );
}

export default BulkUpload;