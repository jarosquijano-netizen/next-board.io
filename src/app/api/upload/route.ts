import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string || 'Untitled Meeting';
    const participants = formData.get('participants') as string || '';
    const date = formData.get('date') as string || new Date().toISOString();

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4',
      'video/mp4',
      'text/plain', 'text/vtt',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['mp3', 'wav', 'mp4', 'txt', 'vtt', 'docx', 'pdf'];

    if (!allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: mp3, wav, mp4, txt, vtt, docx, pdf' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Determine file type
    const isAudioVideo = ['mp3', 'wav', 'mp4'].includes(fileExtension || '');
    const isTranscript = ['txt', 'vtt', 'docx', 'pdf'].includes(fileExtension || '');

    // Extract text from PDF if applicable
    let extractedText: string | null = null;
    if (fileExtension === 'pdf') {
      try {
        // Load pdf-parse using eval to bypass webpack
        const pdfParse = eval('require')('pdf-parse');
        
        // pdf-parse@1.1.1 is a simple function that takes a buffer
        const pdfData = await pdfParse(buffer);
        
        extractedText = pdfData.text;
        if (extractedText) {
          console.log(`📄 Extracted ${pdfData.numpages} pages from PDF (${extractedText.length} characters)`);
        }
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. Please ensure the PDF contains readable text.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/${filename}`,
        isAudioVideo,
        isTranscript,
        extractedText,
      },
      metadata: {
        title,
        participants,
        date,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

