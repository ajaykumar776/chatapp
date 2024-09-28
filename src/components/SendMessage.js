import React, { useState } from 'react';
import apiConfig from '../apiConfig.js';
import { socket } from '../socket.js';
import { FaUpload } from 'react-icons/fa'; // Make sure to install react-icons

const SendMessage = ({ selectedChatId, receiverId, onMessageSent }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState({
    image: '',
    video: '',
    audio: '',
  });
  const [messageType, setMessageType] = useState('text');
  const [mediaFile, setMediaFile] = useState(null); // State for the selected media file

  const handleSendMessage = async () => {
    if (content.trim() === '' && !mediaFile || !selectedChatId) return;

    let uploadedMedia = media;

    // Handle media upload if there is a media file
    if (mediaFile) {
      try {
        const formData = new FormData();
        formData.append('file', mediaFile); // Use 'file' as key for single file
        formData.append('user', receiverId);
        formData.append('tag', 'messages');

        const uploadResponse = await apiConfig('/s3/upload-file', {
          body: formData,
        }, "post", true);

        if (uploadResponse.status) {
          const fileType = mediaFile.type; // Get the MIME type
          console.log("file-type",fileType);
          const { urls } = uploadResponse.response;
          if (fileType.startsWith('image/')) {
            uploadedMedia = { image: urls.original }; // Store the uploaded image URL
          } else if (fileType.startsWith('video/')) {
            uploadedMedia = { video: urls.original }; // Store the uploaded video URL
          } else if (fileType.startsWith('audio/')) {
            uploadedMedia = { audio: urls.original }; // Store the uploaded audio URL
          }
          setMedia((prevMedia) => ({ ...prevMedia, ...uploadedMedia }));
        }
      } catch (error) {
        console.error('Error uploading media:', error.message);
        return; // Exit the function if media upload fails
      }
    }
    // if (mediaFile) {
    //   try {
    //     const formData = new FormData();
    //     formData.append('file', mediaFile); // Use 'file' as the key for a single file
    //     formData.append('user', receiverId);
    //     formData.append('tag', 'messages');
    
    //     const uploadResponse = await apiConfig('/s3/upload-file', {
    //       body: formData,
    //     }, "post", true);
    
    //     if (uploadResponse.status) {
    //       const { urls } = uploadResponse.response;
    
    //       // Identify the media type based on the file's MIME type
    //       let uploadedMedia = {};
    //       const fileType = mediaFile.type; // Get the MIME type
    
    //       if (fileType.startsWith('image/')) {
    //         uploadedMedia = { image: urls.original }; // Store the uploaded image URL
    //       } else if (fileType.startsWith('video/')) {
    //         uploadedMedia = { video: urls.original }; // Store the uploaded video URL
    //       } else if (fileType.startsWith('audio/')) {
    //         uploadedMedia = { audio: urls.original }; // Store the uploaded audio URL
    //       }
    
    //       // Update the media state with the uploaded media URLs
    //       setMedia((prevMedia) => ({ ...prevMedia, ...uploadedMedia }));
    //     }
    //   } catch (error) {
    //     console.error('Error uploading media:', error.message);
    //     return; // Exit the function if media upload fails
    //   }
    // }
    

    const messageData = {
      content,
      media: uploadedMedia,
      message_type: messageType,
      chat_id: selectedChatId,
      receiver_id: receiverId,
    };

    try {
      const response = await apiConfig('/chats/messages/send', {
        body: JSON.stringify(messageData),
      }, "post");
      const resMessage = {
        content: response?.response?.messageDetails?.content || content,
        chat_id: response?.response?.messageDetails?.chatDetails?._id || selectedChatId,
        media: response?.response?.messageDetails?.media || uploadedMedia,
        message_type: response?.response?.messageDetails?.message_type || messageType,
        createdAt: response?.response?.messageDetails?.createdAt || new Date(),
        senderDetails: response?.response?.messageDetails?.senderDetails,
      };
      console.log(resMessage, "resMessage");
      socket.emit('sendMessage', resMessage);
      setContent('');  // Clear input after sending
      setMediaFile(null); // Reset the media file after sending
      onMessageSent();  // Notify parent component
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle media file selection
  const handleMediaChange = (event) => {
    if (event.target.files.length > 0) {
      setMediaFile(event.target.files[0]); // Store the selected file
      event.target.value = ''; // Reset the input field to allow re-selection
    }
  };

  return (
    <div className="flex items-center mt-4">
      <label htmlFor="media-upload" className="cursor-pointer">
        <FaUpload className="text-gray-600 mr-2" size={24} />
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*,audio/*" // Accept images, videos, and audio files
          onChange={handleMediaChange}
          className="hidden" // Hide the default file input
        />
      </label>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button onClick={handleSendMessage} disabled={!content.trim() && !mediaFile} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
        Send
      </button>
    </div>
  );
};

export default SendMessage;
