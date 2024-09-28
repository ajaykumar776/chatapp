import React, { useEffect, useState } from 'react';
import apiConfig from '../apiConfig.js';
import '../../src/Chat.css';
import SendMessage from '../components/SendMessage.js';
import { socket } from '../socket.js';

const MessageArea = ({ selectedChatId, contacts, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [user, setUser] = useState("NotFound");

  const selectedChat = contacts && contacts.length ? contacts.find(contact => contact.chatId === selectedChatId) : {};

  // Fetch logged-in user ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiConfig('/user/me');
        console.log(response.response, "me");
        setUser(response?.response.profile);  // Directly accessing user ID from response
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch messages when selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await apiConfig(`/chats/${selectedChatId}/messages`);
          console.log(response);
          if (response?.response.messages) {
            setMessages(response.response.messages);
          }
        } catch (error) {
          console.error('Error fetching chat messages:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [selectedChatId]);

  // Handle socket connection for new messages
  useEffect(() => {
    if (selectedChat) {
      console.log(selectedChat);
      setReceiverId(selectedChat.receiver_id);  // Set receiver ID for chat
      socket.emit('joinChat', selectedChatId);  // Join the chat room
    }
  }, [selectedChatId]);

  useEffect(() => {
    socket.on('message', (message) => {
      console.log("new message", message);
      if (message.chat_id === selectedChatId) {
        // Append new message to the list
        setMessages((prevMessages) => [...prevMessages, message]);
      } else {
        onNewMessage(message.chat_id);
      }
    });

    return () => {
      socket.off('message');  // Clean up event listener
    };
  }, [selectedChatId, onNewMessage]);

  // Handle post message send actions
  const handleMessageSent = () => {
    // Optionally fetch messages or perform other actions after sending
  };

  // Function to render media based on type
  const renderMedia = (media) => {
    if (media?.image) {
      return <img src={media?.image} alt="Message Image" className="rounded-lg max-w-xs" />;
    } else if (media?.video) {
      return (
        <video controls className="rounded-lg max-w-xs">
          <source src={media.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (media?.audio) {
      return (
        <audio controls className="rounded-lg">
          <source src={media.audio} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      );
    }
    return null; // Return nothing if no media type matches
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="chat-header text-right mb-4">
        <span className="font-bold">Logged in as: <strong>{user?.fname}</strong></span>
      </div>
      <div className="message-area flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 shadow-md">
        {selectedChat ? (
          <>
            <h2 className="text-lg font-semibold mb-2">Chat with {selectedChat.contact_name}</h2>
            {loading ? (
              <p>Loading messages...</p>
            ) : (
              <div className="messages-list">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message?._id || `${message?.content}-${Math.random()}`} 
                      className={`message my-2 p-2 rounded-lg ${message?.senderDetails?._id === user._id ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}
                    >
                      <p>{message?.content || 'No content'}</p>
                      {renderMedia(message.media)} {/* Render the media based on type */}
                      <span className="text-xs text-gray-500">{new Date(message?.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No messages in this chat.</p>
                )}
              </div>
            )}
            <SendMessage 
              selectedChatId={selectedChatId} 
              receiverId={receiverId}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <p className="text-gray-500">Select a contact to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default MessageArea;
