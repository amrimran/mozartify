import React, { useState } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const FileDownloaderPage = ({ filesToDownload = [] }) => { // Default to empty array
  const [fileData, setFileData] = useState([]);
  const storage = getStorage(); // Initialize Firebase Storage

  const downloadFiles = async () => {
    if (!Array.isArray(filesToDownload)) {
      console.error('filesToDownload is not an array:', filesToDownload);
      return;
    }

    try {
      const filesWithUrls = await Promise.all(
        filesToDownload.map(async (file) => {
          try {
            const fileRef = ref(storage, `coverImageUrl/${file.path}`); // Create a reference to the file in Firebase Storage
            const fileUrl = await getDownloadURL(fileRef); // Get the download URL

            // Fetch the file data
            const response = await fetch(fileUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            const blob = await response.blob();

            // Create a download link and trigger a download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = file.path.split('/').pop(); // Use the file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return { ...file, fileUrl }; // Return the updated file object
          } catch (fileError) {
            console.error(`Error downloading file ${file.path}:`, fileError);
            return null; // Skip this file if there's an error
          }
        })
      );

      // Filter out any null values (files that failed to download)
      const successfulFiles = filesWithUrls.filter(file => file !== null);
      setFileData(successfulFiles); // Update state with successfully downloaded files
    } catch (error) {
      console.error('Error downloading files from Firebase Storage:', error);
    }
  };

  return (
    <div>
      <h1>File Downloader</h1>
      <p>Your files are being downloaded. If not, please check your browser's download settings.</p>
      <button onClick={downloadFiles}>Download Files</button> {/* Button to trigger downloads */}
    </div>
  );
};

export default FileDownloaderPage;
