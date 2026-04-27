"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCompany } from "@/components/providers/CompanyProvider";
import { updateCompanyConfig } from "@/lib/firestore";
import { CompanyConfig } from "@/types/company";
import PolicyManager from "@/components/PolicyManager";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { config, loading: configLoading, refreshConfig } = useCompany();
  
  const [formData, setFormData] = useState<CompanyConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (config && !formData) {
      setFormData(config);
    }
  }, [config, formData]);

  if (authLoading || configLoading || !formData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Basic guard (we'll expand this later)
  if (!user || user.email !== "gfreyria@gmail.com") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
          <p>You do not have permission to view the Admin Dashboard.</p>
          <a href="/" className="text-blue-600 hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("apiKey_")) {
      const keyName = name.replace("apiKey_", "");
      setFormData((prev) => prev ? {
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [keyName]: value
        }
      } : null);
    } else {
      setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      await updateCompanyConfig(formData);
      await refreshConfig();
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save", error);
      setSaveMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Configure your Corporate GPT instance</p>
          </div>
          <a href="/" className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
            Back to App
          </a>
        </header>

        <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          
          {/* Branding Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">Branding & Theming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Slogan</label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo URL</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Theme Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">AI Configuration</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Global System Prompt</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This dictates the overarching persona and rules for the main corporate assistant.
              </p>
              <textarea
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleChange}
                rows={5}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent resize-y"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Provider API Keys</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provide the keys for the models you wish to use. If left blank, the system will fall back to environment variables.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">OpenAI API Key</label>
                  <input
                    type="password"
                    name="apiKey_openai"
                    value={formData.apiKeys?.openai || ""}
                    onChange={handleChange}
                    placeholder="sk-..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Anthropic API Key</label>
                  <input
                    type="password"
                    name="apiKey_anthropic"
                    value={formData.apiKeys?.anthropic || ""}
                    onChange={handleChange}
                    placeholder="sk-ant-..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Google Gemini API Key</label>
                  <input
                    type="password"
                    name="apiKey_google"
                    value={formData.apiKeys?.google || ""}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">DeepSeek API Key</label>
                  <input
                    type="password"
                    name="apiKey_deepseek"
                    value={formData.apiKeys?.deepseek || ""}
                    onChange={handleChange}
                    placeholder="sk-..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Perplexity API Key</label>
                  <input
                    type="password"
                    name="apiKey_perplexity"
                    value={formData.apiKeys?.perplexity || ""}
                    onChange={handleChange}
                    placeholder="pplx-..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Super Admin / Tiers Section */}
          <div className="space-y-4 pt-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-semibold">Tier & Budget Constraints</h2>
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded">Super Admin Only</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max User Limit</label>
                <select
                  name="userLimit"
                  value={formData.userLimit}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  <option value={20}>Level 1 - 20 Users</option>
                  <option value={50}>Level 2 - 50 Users</option>
                  <option value={100}>Level 3 - 100 Users</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget (MXN)</label>
                <input
                  type="number"
                  name="monthlyBudgetMxn"
                  value={formData.monthlyBudgetMxn}
                  onChange={handleChange}
                  min={0}
                  step={100}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            {saveMessage && (
              <span className={`text-sm font-medium ${saveMessage.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                {saveMessage}
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>

        </form>

        {/* Company Policies (RAG) Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <PolicyManager />
        </div>

      </div>
    </div>
  );
}
