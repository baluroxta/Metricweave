import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  console.log('Upload API: Received POST request');
  console.log('Upload API: Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    await ensureUploadDir();
    console.log('Upload API: Upload directory ensured');
    
    const formData = await request.formData();
    console.log('Upload API: FormData parsed');
    
    const file = formData.get('file') as File;
    console.log('Upload API: File from form data:', file ? `${file.name} (${file.size} bytes)` : 'null');
    
    if (!file) {
      console.log('Upload API: No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique file ID and path
    const fileId = nanoid(16);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Convert File to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    
    const storedFile = {
      id: fileId,
      originalName: file.name,
      fileName,
      path: filePath,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date()
    };

    console.log('Upload API: File stored successfully with ID:', fileId);
    
    return NextResponse.json({
      success: true,
      file: storedFile
    });
  } catch (error) {
    console.error('Upload API: Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'File upload API endpoint' });
}