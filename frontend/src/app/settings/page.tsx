'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, saveUserSettings, getUserSettings } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserSettings {
  aiProvider: string;
  apiKey: string;
  theme: string;
  [key: string]: any;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    aiProvider: 'gemini',
    apiKey: '',
    theme: 'light',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        loadUserSettings(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Load user settings
  const loadUserSettings = async (userId: string) => {
    try {
      const userSettings = await getUserSettings(userId);
      if (userSettings) {
        setSettings({
          aiProvider: userSettings.aiProvider || 'gemini',
          apiKey: userSettings.apiKey || '',
          theme: userSettings.theme || 'light',
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setMessage({
        text: 'Failed to load settings. Please try again.',
        type: 'error',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({
        text: 'You must be logged in to save settings.',
        type: 'error',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      await saveUserSettings(user.uid, settings);
      setMessage({
        text: 'Settings saved successfully!',
        type: 'success',
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        text: 'Failed to save settings. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">NeuroNest-AI</h1>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link href="/chat" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Chat
            </Link>
            <Link href="/projects" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Projects
            </Link>
            <Link href="/settings" className="text-blue-600 dark:text-blue-400 font-medium">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
          
          {!user ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200">
                You need to be logged in to save your settings.{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
                {' '}or{' '}
                <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          ) : null}
          
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
              <p>{message.text}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Provider */}
            <div>
              <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AI Provider
              </label>
              <select
                id="aiProvider"
                name="aiProvider"
                value={settings.aiProvider}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select your preferred AI provider for generating responses.
              </p>
            </div>
            
            {/* API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter your ${settings.aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API key`}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your API key is stored securely and used only for making requests to the AI provider.
                {settings.aiProvider === 'gemini' ? (
                  <span> Get your Gemini API key from the <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a>.</span>
                ) : (
                  <span> Get your OpenAI API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">OpenAI dashboard</a>.</span>
                )}
              </p>
            </div>
            
            {/* Theme */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme for the application.
              </p>
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={saving || !user}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}