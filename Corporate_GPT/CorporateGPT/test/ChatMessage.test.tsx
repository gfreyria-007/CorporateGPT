/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMessage } from '../src/components/ChatMessage';
import { Message } from '../src/types';

const mockMessage: Message = {
  id: '1',
  role: 'user',
  content: 'Hello, this is a test message',
  timestamp: Date.now(),
  imageData: null,
  model: 'gemini-pro'
};

const mockTMessage: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hello! How can I help you today?',
  timestamp: Date.now(),
  imageData: null,
  model: 'gemini-pro'
};

describe('ChatMessage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(<ChatMessage message={mockMessage} lang="es" />);
    
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    expect(screen.getByText('Tú')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={mockTMessage} lang="es" />);
    
    expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    expect(screen.getByText('Asistente')).toBeInTheDocument();
  });

  it('shows copy button for messages', () => {
    render(<ChatMessage message={mockMessage} lang="es" />);
    
    const copyButton = screen.getByTitle('Copiar mensaje');
    expect(copyButton).toBeInTheDocument();
  });

  it('handles copy functionality', async () => {
    render(<ChatMessage message={mockMessage} lang="es" />);
    
    const copyButton = screen.getByTitle('Copiar mensaje');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
    });
  });

  it('shows download button for images', () => {
    const messageWithImage = {
      ...mockMessage,
      imageData: 'data:image/png;base64,test'
    };
    
    render(<ChatMessage message={messageWithImage} lang="es" />);
    
    const downloadButton = screen.getByTitle('Descargar imagen');
    expect(downloadButton).toBeInTheDocument();
  });

  it('handles image download', () => {
    const messageWithImage = {
      ...mockMessage,
      imageData: 'data:image/png;base64,test'
    };
    
    render(<ChatMessage message={messageWithImage} lang="es" />);
    
    const downloadButton = screen.getByTitle('Descargar imagen');
    fireEvent.click(downloadButton);
    
    // Check if anchor element was created
    const anchor = document.createElement('a');
    expect(anchor.href).toBe('data:image/png;base64,test');
    expect(anchor.download).toBe('generated-image-1.png');
  });

  it('supports English language', () => {
    render(<ChatMessage message={mockMessage} lang="en" />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    render(<ChatMessage message={mockMessage} lang="es" />);
    
    // Check if timestamp is displayed (format may vary)
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });
});