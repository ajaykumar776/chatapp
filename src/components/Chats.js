import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Chat.css'; // Create a simple CSS file for styling the messages

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const loggedInUserId = '66d82a7df390277557788034'; // Static logged-in user ID for now

  useEffect(() => {
    // Fetch chat messages from the API
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/chats/66eaad00c17e376a085ef621/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, []);

  return (
    <div className="chat-container">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`message-box ${message.sender._id === loggedInUserId ? 'my-message' : 'other-message'}`}
        >
          <div className="message-content">
            <p>{message.content}</p>
          </div>
          <div className="message-info">
            <span>{message.sender.fname} {message.sender.lname}</span>
            <span>{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chat;
