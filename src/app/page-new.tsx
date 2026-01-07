'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import UploadPanel from '@/components/UploadPanel';
import { Sparkles, Upload, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEMO_MODE = !process.env.NEXT_PUBLIC_HAS_API_KEY;

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleProcessComplete = (meetingId: string) => {
    router.push(`/board/${meetingId}`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Demo Mode Banner */}
        {DEMO_MODE && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
            <div className="max-w-7xl mx-auto px-8 py-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <p className="text-sm text-amber-200">
                  <span className="font-semibold">Demo Mode:</span> Using mock AI responses.
                  Add ANTHROPIC_API_KEY for real Claude AI processing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create New Board
              </h1>
              <p className="text-slate-400">
                Upload your meeting transcript or recording and let AI extract action items
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Quick Upload</p>
                  <p className="text-sm text-slate-400">Drag & drop or browse</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">AI Powered</p>
                  <p className="text-sm text-slate-400">Claude 3.5 Sonnet</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Smart Boards</p>
                  <p className="text-sm text-slate-400">Auto-organized</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <UploadPanel onProcessComplete={handleProcessComplete} />
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">What NextBoard Does</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Extracts action items with owners and due dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Identifies key decisions made during meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Tracks follow-up items and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Organizes everything into a beautiful Kanban board</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Supported Formats</h3>
              <div className="grid grid-cols-2 gap-3">
                {['MP3', 'MP4', 'WAV', 'TXT', 'VTT', 'DOCX'].map((format) => (
                  <div key={format} className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                    <span className="text-sm font-medium text-slate-300">{format}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





