// Client-side file storage utilities

export interface StoredFile {
  id: string;
  originalName: string;
  fileName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Client-side file upload function
export async function uploadFile(file: File): Promise<StoredFile> {
  try {
    console.log('Starting file upload:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Sending POST request to /api/upload-data');
    
    const response = await fetch('/api/upload-data', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Upload successful, file ID:', result.file?.id);
    return result.file;
  } catch (error) {
    console.error('Upload error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Could not reach upload server. Please check your connection.');
    }
    throw error;
  }
}