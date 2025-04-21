import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function AddSubscription() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    subscription_date: new Date().toISOString().split('T')[0],
    renewal_type: 'monthly'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter a subscription name');
      }
      
      if (!formData.cost || isNaN(formData.cost) || parseFloat(formData.cost) <= 0) {
        throw new Error('Please enter a valid cost');
      }
      
      if (!formData.subscription_date) {
        throw new Error('Please select a subscription date');
      }

      const subscriptionData = {
        ...formData,
        cost: parseFloat(formData.cost).toFixed(2)
      };
      
      const response = await axios.post(
        'http://localhost:8000/api/subscriptions/', 
        subscriptionData,
        {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        setLoading(false);
        navigate('/');
      }
      else {
        setLoading(false);
        setError('Failed to add subscription. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      
      if (err.message) {
        setError(err.message);
      } else if (err.response) {
        const serverError = err.response.data;
        if (typeof serverError === 'object') {
          const errorMessages = [];
          for (const field in serverError) {
            errorMessages.push(`${field}: ${serverError[field].join(' ')}`);
          }
          setError(errorMessages.join(', '));
        } else {
          setError('Failed to add subscription. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-200 mb-6">
        Add New <span className="text-teal-400">Subscription</span>
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-900/50 border border-rose-700 text-rose-200 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
            Service Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Netflix, Spotify, etc."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400 transition-colors"
            required
          />
        </div>
        
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-slate-300 mb-1">
            Cost
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">$</span>
            </div>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full pl-7 pr-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400 transition-colors"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="subscription_date" className="block text-sm font-medium text-slate-300 mb-1">
            Subscription Start Date
          </label>
          <input
            type="date"
            id="subscription_date"
            name="subscription_date"
            value={formData.subscription_date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            required
          />
        </div>
        
        <div>
          <label htmlFor="renewal_type" className="block text-sm font-medium text-slate-300 mb-1">
            Billing Cycle
          </label>
          <div className="relative">
            <select
              id="renewal_type"
              name="renewal_type"
              value={formData.renewal_type}
              onChange={handleChange}
              className="appearance-none w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors pr-10"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : 'Add Subscription'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-700 text-slate-200 font-medium rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSubscription;