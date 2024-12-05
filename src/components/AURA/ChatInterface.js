import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bot, Send, X, BatteryMedium, Signal, Cloud, Sun, CloudRain, Wind, Droplets, ThermometerSun } from 'lucide-react';
import { AURA_SYSTEM_CONTEXT, generateEnhancedPrompt, getQueryType } from './AuraPrompts';
import './ChatInterface.css';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const WeatherCard = ({ weather }) => {
  return (
    <div className="weather-card">
      <div className="weather-header">
        <div className="weather-icon">
          {weather.condition === 'Clear' ? <Sun /> : 
           weather.condition === 'Cloudy' ? <Cloud /> : <CloudRain />}
        </div>
        <div className="weather-info">
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-desc">{weather.condition}</div>
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-detail-item">
          <Wind size={16} />
          <span>Wind: {weather.windSpeed}</span>
        </div>
        <div className="weather-detail-item">
          <Droplets size={16} />
          <span>Humidity: {weather.humidity}%</span>
        </div>
        <div className="weather-detail-item">
          <ThermometerSun size={16} />
          <span>Feels like: {weather.feelsLike}°C</span>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ droneStatus, missionData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  useEffect(() => {
    console.log('API Key available:', !!GEMINI_API_KEY);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello, I'm AURA, your AI Unified Rescue Assistant. I'm here to help with mission planning, drone operations, and emergency protocols. How can I assist you today?"
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const userMessage = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);

      // Check if it's a weather query
      if (input.toLowerCase().includes('weather')) {
        // Simulate weather data - In real app, this would come from a weather API
        const weatherData = {
          temperature: 25,
          condition: 'Clear',
          windSpeed: '5 km/h',
          humidity: 65,
          feelsLike: 27
        };

        const response = {
          text: `Current weather conditions are suitable for drone operations:
• Temperature: ${weatherData.temperature}°C
• Wind Speed: ${weatherData.windSpeed}
• Conditions: ${weatherData.condition}

Based on these conditions, it's safe to proceed with drone dispatch. Would you like me to help you plan the mission?`,
          weatherData: weatherData
        };

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.text,
          type: 'weather',
          weatherData: weatherData
        }]);
      } else {
        // Regular chat handling using Gemini API
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40,
          }
        });

        const context = {
          droneStatus: {
            battery: droneStatus?.battery ?? 100,
            signalStrength: droneStatus?.signalStrength ?? 100,
            status: droneStatus?.status ?? 'Ready'
          },
          missionData: {
            areaCovered: missionData?.areaCovered ?? '0%',
            objectsDetected: missionData?.objectsDetected ?? 0,
            weatherCondition: missionData?.weatherCondition ?? 'Clear',
            windSpeed: missionData?.windSpeed ?? '0 km/h'
          },
          currentTime: new Date().toISOString()
        };

        const enhancedPrompt = generateEnhancedPrompt(input, context);
        
        const chat = await model.startChat({
          history: [
            { role: 'system', parts: [AURA_SYSTEM_CONTEXT] },
            ...messages.map(msg => ({
              role: msg.role,
              parts: [msg.content],
            }))
          ],
        });

        const result = await chat.sendMessage(enhancedPrompt);
        const response = await result.response;
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text(),
          type: getQueryType(input)
        }]);
      }
      
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
      setInput('');
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}`,
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-icon" onClick={() => setIsOpen(!isOpen)}>
        <Bot />
      </div>
      
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="aura-logo">
            <Bot />
          </div>
          <div className="header-text">
            <h3>AURA</h3>
            <small>AI Unified Rescue Assistant</small>
          </div>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        <div className="status-indicators">
          <div className="status-indicator">
            <BatteryMedium size={16} />
            <span>{droneStatus.battery}%</span>
          </div>
          <div className="status-indicator">
            <Signal size={16} />
            <span>{droneStatus.signalStrength}%</span>
          </div>
          <div className="status-indicator">
            <Cloud size={16} />
            <span>{missionData.weatherCondition}</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role} ${message.type || ''}`}>
              {message.content}
              {message.type === 'weather' && message.weatherData && (
                <WeatherCard weather={message.weatherData} />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask AURA about your mission..."
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button 
            className="send-button"
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <Send />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;