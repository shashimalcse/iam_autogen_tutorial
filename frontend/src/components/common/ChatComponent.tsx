/*
  Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.

  This software is the property of WSO2 LLC. and its suppliers, if any.
  Dissemination of any information or reproduction of any material contained
  herein is strictly forbidden, unless permitted by WSO2 in accordance with
  the WSO2 Commercial License available at http://wso2.com/licenses.
  For specific language governing the permissions and limitations under
  this license, please see the license as well as any agreement you've
  entered into with WSO2 governing the purchase of this software and any
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ConsentRequest {
  id: string;
  content: string;
  options: {
    accept: string;
    reject: string;
  };
}

interface AuthRequest {
  state: string;
  auth_url: string;
  context?: Record<string, any>;
}

const ChatComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingConsent, setPendingConsent] = useState<ConsentRequest | null>(null);
  const [pendingAuth, setPendingAuth] = useState<AuthRequest | null>(null);
  const [authorizationCompleted, setAuthorizationCompleted] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>('');

  // Generate session ID
  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  };

  // Add message helpers
  const addMessage = useCallback((type: Message['type'], content: string, id?: string) => {
    const message: Message = {
      id: id || Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const addUserMessage = useCallback((content: string) => addMessage('user', content), [addMessage]);
  const addAssistantMessage = useCallback((content: string, id?: string) => addMessage('assistant', content, id), [addMessage]);
  const addSystemMessage = useCallback((content: string) => addMessage('system', content), [addMessage]);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!sessionId.current) {
      sessionId.current = generateSessionId();
    }

    // Note: You'll need to replace this with your actual WebSocket URL
    const wsUrl = `ws://localhost:8000/chat?session_id=${sessionId.current}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      setIsTyping(false);
      
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          addAssistantMessage(data.content, data.messageId);
        } else if (data.type === 'consent_request') {
          setPendingConsent({
            id: data.messageId,
            content: data.content,
            options: data.consentOptions || { accept: 'Accept', reject: 'Reject' }
          });
        } else if (data.type === 'auth_request') {
          setPendingAuth({
            state: data.state,
            auth_url: data.auth_url,
            context: data.context
          });
        }
      } catch (error) {
        // Handle plain text messages
        addAssistantMessage(event.data);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setIsTyping(false);
    };

    ws.current.onerror = () => {
      setIsConnected(false);
      setIsTyping(false);
    };
  }, [addAssistantMessage]);

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'auth_callback' && event.data.state) {
        setAuthorizationCompleted(true);
        addSystemMessage('Authorization completed successfully. Processing your booking...');
        setPendingAuth(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addSystemMessage]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending messages
  const sendMessage = () => {
    if (!inputMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    addUserMessage(inputMessage);
    setIsTyping(true);

    const jsonMsg = {
      type: 'user_message',
      content: inputMessage,
      sessionId: sessionId.current
    };

    ws.current.send(JSON.stringify(jsonMsg));
    setInputMessage('');
  };

  // Handle consent response
  const handleConsentResponse = (decision: 'accept' | 'reject') => {
    if (!pendingConsent) return;

    const responseText = decision === 'accept' ? pendingConsent.options.accept : pendingConsent.options.reject;
    addUserMessage(responseText);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const response = {
        type: 'consent_response',
        decision,
        messageId: pendingConsent.id,
        sessionId: sessionId.current
      };
      ws.current.send(JSON.stringify(response));
    }

    setPendingConsent(null);
  };

  // Handle authorization
  const handleAuthorization = () => {
    if (!pendingAuth) return;

    setAuthorizationCompleted(false);
    addSystemMessage('Authorization window opened. Please complete the login process.');

    const authWindow = window.open(
      pendingAuth.auth_url,
      'OAuthWindow',
      'width=600,height=700,left=200,top=100'
    );

    if (!authWindow) {
      addSystemMessage('Popup was blocked. Please allow popups for this site.');
      return;
    }

    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        setTimeout(() => {
          if (pendingAuth && !authorizationCompleted) {
            addSystemMessage('Authorization window was closed. The booking was not completed.');
            setPendingAuth(null);
          }
        }, 500);
      }
    }, 1000);
  };

  // Initialize connection when chat opens
  useEffect(() => {
    if (isOpen && !ws.current) {
      connectWebSocket();
    }
  }, [isOpen, connectWebSocket]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    // Basic markdown parsing
    let html = text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 md:p-4 shadow-lg transition-all duration-200 hover:shadow-xl ${isOpen ? 'hidden' : 'block'}`}
      >
        <ChatBubbleLeftEllipsisIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 top-4 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[500px] z-50 bg-white rounded-xl shadow-lg border border-secondary-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white p-3 md:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-sm md:text-lg">
                G
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Gardeo Hotel</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm opacity-90">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-accent-400'}`}></div>
                  <span>{isConnected ? 'AI Assistant Online' : 'Connecting...'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-500 p-1.5 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-secondary-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-xs px-3 md:px-4 py-2 rounded-lg text-sm md:text-base ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : message.type === 'system'
                    ? 'bg-primary-50 text-primary-800 italic text-center border border-primary-200'
                    : 'bg-white text-secondary-900 border border-secondary-200 shadow-sm'
                }`}>
                  {message.type === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(message.content)}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-secondary-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Consent Request */}
            {pendingConsent && (
              <div className="card">
                <p className="mb-3 text-sm md:text-base text-secondary-700">{pendingConsent.content}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleConsentResponse('accept')}
                    className="btn-primary text-sm md:text-base"
                  >
                    {pendingConsent.options.accept}
                  </button>
                  <button
                    onClick={() => handleConsentResponse('reject')}
                    className="btn-secondary text-sm md:text-base"
                  >
                    {pendingConsent.options.reject}
                  </button>
                </div>
              </div>
            )}

            {/* Auth Request */}
            {pendingAuth && (
              <div className="card">
                <h4 className="font-semibold mb-2 text-sm md:text-base text-secondary-900">Authorization Required</h4>
                <p className="text-secondary-600 mb-3 text-sm md:text-base">To complete your hotel booking, you need to authorize with your Asgardeo account.</p>
                {pendingAuth.context && (
                  <div className="mb-3 text-sm bg-secondary-50 p-2 rounded-lg">
                    <strong className="text-secondary-900">Booking Details:</strong>
                    {Object.entries(pendingAuth.context).map(([key, value]) => (
                      <div key={key} className="text-secondary-600 text-xs">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleAuthorization}
                  className="btn-primary text-sm md:text-base w-full sm:w-auto"
                >
                  Authorize Booking
                </button>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-secondary-200 rounded-lg px-4 py-2 flex items-center gap-1 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-secondary-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me about rooms, amenities, or bookings..."
                className="input-field text-sm md:text-base"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatComponent;
