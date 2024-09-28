import React from 'react';

const ContactList = ({ contacts, selectedChatId, onSelectChat }) => {
  return (
    <div className="overflow-y-auto h-full p-4">
      {contacts && contacts.length ? contacts.map(contact => (
        <div
          key={contact.chatId}
          className={`p-4 mb-2 cursor-pointer rounded-lg transition-all ${
            selectedChatId === contact.chatId ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => onSelectChat(contact.chatId)}
        >
          <div className="flex justify-between items-center">
            <div className="font-bold text-gray-700">{contact.contact_name}</div>
            <div className="text-sm text-gray-500">{contact.createdAt}</div>
          </div>
          <div className="text-sm text-gray-500">{contact.lastMessage}</div>
          {contact.unreadMessages > 0 && (
            <div className="mt-1 text-xs text-red-500">
              {contact.unreadMessages} unread
            </div>
          )}
        </div>
      )) : (
        <p className="text-gray-500">No contacts</p>
      )}
    </div>
  );
};

export default ContactList;
