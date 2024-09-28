import React, { useState, useEffect } from 'react';
import ContactList from './components/ContactList.js';
import MessageArea from './components/MessageArea.js';
import apiConfig from '../src/apiConfig.js';
import './App.css';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await apiConfig('/chats/contacts', {});
        setContacts(response.response.contactList.map(contact => ({
          ...contact,
          unreadMessages: contact.unreadMessages || 0, // Use unreadCount from the response or set to 0
        })));
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  const handleNewMessage = (chatId) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => {
        if (contact.chatId === chatId) {
          return {
            ...contact,
            unreadMessages: contact.unreadMessages + 1,
          };
        }
        return contact;
      })
    );
  };
  

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 border-r">
        <ContactList
          contacts={contacts}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>
      <div className="w-3/4 bg-white flex flex-col">
        {selectedChatId ? (
          <MessageArea 
          contacts={contacts} 
          selectedChatId={selectedChatId} 
          onNewMessage={handleNewMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
