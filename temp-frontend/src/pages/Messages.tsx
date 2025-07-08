import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Search,
} from 'lucide-react';
import { mockMessages } from '../data/mockData';
import { Message, ChatMessage } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const Messages: React.FC = () => {
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', mockMessages);
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'user1',
        senderName: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
        isDoctor: false,
      };

      const updatedMessages = messages.map(msg => 
        msg.id === selectedConversation.id 
          ? {
              ...msg,
              messages: [...msg.messages, chatMessage],
              lastMessage: newMessage,
              timestamp: new Date().toISOString(),
            }
          : msg
      );

      setMessages(updatedMessages);
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, chatMessage],
        lastMessage: newMessage,
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = messages.reduce((sum, msg) => sum + msg.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your healthcare providers</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {totalUnread > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {totalUnread} unread
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <MessageCircle className="h-5 w-5 text-gray-500" />
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 max-h-[450px] overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedConversation(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.doctorName}
                          </p>
                          {message.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {message.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {message.lastMessage}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(message.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.doctorName}</h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isDoctor ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.isDoctor
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.isDoctor ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleSendMessage}
                      icon={Send}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">
                    Choose a doctor from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
              Start a conversation with your healthcare providers to get personalized care.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};