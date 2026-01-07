'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Type, Clipboard } from 'lucide-react';

interface UploadPanelProps {
  onProcessComplete: (meetingId: string) => void;
}

export default function UploadPanel({ onProcessComplete }: UploadPanelProps) {
  const [mode, setMode] = useState<'file' | 'text'>('file'); // Toggle between file and text mode
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState(''); // For pasted text
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on mode
    if (mode === 'file' && !file) {
      setError('Please select a file');
      return;
    }
    if (mode === 'text' && !transcript.trim()) {
      setError('Please paste or type your transcript');
      return;
    }

    setError(null);

    try {
      if (mode === 'text') {
        // Direct text processing (skip upload step)
        setIsProcessing(true);

        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: transcript.trim(),
            title: title || 'Untitled Meeting',
            participants,
            date: new Date().toISOString(),
          }),
        });

        if (!processResponse.ok) {
          const data = await processResponse.json();
          console.error('❌ Processing failed:', data);
          const errorMessage = data.error || 'Processing failed';
          const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
          const errorHint = data.hint ? `\n\n💡 ${data.hint}` : '';
          throw new Error(errorMessage + errorDetails + errorHint);
        }

        const processData = await processResponse.json();
        setIsProcessing(false);

        // Reset form
        setTranscript('');
        setTitle('');
        setParticipants('');

        // Notify parent
        onProcessComplete(processData.meeting.id);
      } else {
        // File upload mode (existing logic)
        setIsUploading(true);

        // Step 1: Upload file
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('title', title || 'Untitled Meeting');
        formData.append('participants', participants);
        formData.append('date', new Date().toISOString());

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const data = await uploadResponse.json();
          throw new Error(data.error || 'Upload failed');
        }

        const uploadData = await uploadResponse.json();
        setIsUploading(false);
        setIsProcessing(true);

        // Step 2: Process transcript
        const processBody = uploadData.file.extractedText
          ? {
              transcript: uploadData.file.extractedText,
              title: uploadData.metadata.title,
              participants: uploadData.metadata.participants,
              date: uploadData.metadata.date,
            }
          : {
              filepath: uploadData.file.path,
              title: uploadData.metadata.title,
              participants: uploadData.metadata.participants,
              date: uploadData.metadata.date,
            };

        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(processBody),
        });

        if (!processResponse.ok) {
          const data = await processResponse.json();
          console.error('❌ Processing failed:', data);
          const errorMessage = data.error || 'Processing failed';
          const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
          const errorHint = data.hint ? `\n\n💡 ${data.hint}` : '';
          throw new Error(errorMessage + errorDetails + errorHint);
        }

        const processData = await processResponse.json();
        setIsProcessing(false);

        // Reset form
        setFile(null);
        setTitle('');
        setParticipants('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent
        onProcessComplete(processData.meeting.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-3 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
              mode === 'file'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            disabled={isLoading}
          >
            <Upload className="w-5 h-5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
              mode === 'text'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            disabled={isLoading}
          >
            <Type className="w-5 h-5" />
            Paste Text
          </button>
        </div>

        {/* File Upload Zone (only show in file mode) */}
        {mode === 'file' && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-slate-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.mp4,.wav,.txt,.vtt,.docx,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {file ? file.name : 'Drop your file here, or click to browse'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Supports: MP3, MP4, WAV, TXT, VTT, DOCX, <span className="font-semibold text-blue-600 dark:text-blue-400">PDF</span>
              </p>
            </label>
          </div>
        )}

        {/* Text Paste Area (only show in text mode) */}
        {mode === 'text' && (
          <div className="relative">
            <label 
              htmlFor="transcript" 
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4" />
              Paste Meeting Transcript
            </label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here... 

Example:
Meeting Date: October 18, 2024
Attendees: John, Sarah, Mike

Discussion Points:
- Product roadmap for Q4
- Need to finalize designs by Friday (Sarah)
- Mike to follow up with engineering team
- Budget approval needed from finance..."
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              disabled={isLoading}
            />
            {transcript && (
              <div className="absolute top-2 right-2">
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-xs text-blue-700 dark:text-blue-300">
                  {transcript.length} characters
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Team Sync"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Participants (optional)
            </label>
            <input
              type="text"
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Alex, Sarah, Mike"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={(mode === 'file' && !file) || (mode === 'text' && !transcript.trim()) || isLoading}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isUploading && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          )}
          {isProcessing && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing with AI...
            </>
          )}
          {!isLoading && (
            <>
              <FileText className="w-5 h-5" />
              Generate Board
            </>
          )}
        </button>
      </form>
    </div>
  );
}

