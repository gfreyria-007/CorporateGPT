/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInput } from '../src/components/ChatInput';
import { Message } from '../src/types';

const mockOnSend = jest.fn();
const mockOnStop = jest.fn();

describe('ChatInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    expect(input).toBeInTheDocument();
  });

  it('handles text input', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    expect(input).toHaveValue('Hello world');
  });

  it('sends message on Enter key', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
  });

  it('does not send message on Shift+Enter', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('sends message on send button click', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    const sendButton = screen.getByTitle('Enviar mensaje');
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
  });

  it('disables send button when empty', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const sendButton = screen.getByTitle('Enviar mensaje');
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when has text', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByTitle('Enviar mensaje');
    expect(sendButton).not.toBeDisabled();
  });

  it('shows loading state', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} isLoading />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    expect(input).toBeDisabled();
    
    const sendButton = screen.getByTitle('Enviar mensaje');
    expect(sendButton).toBeDisabled();
  });

  it('handles stop functionality', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} isLoading />);
    
    const stopButton = screen.getByTitle('Detener generación');
    fireEvent.click(stopButton);
    
    expect(mockOnStop).toHaveBeenCalled();
  });

  it('shows stop button when loading', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} isLoading />);
    
    const stopButton = screen.getByTitle('Detener generación');
    expect(stopButton).toBeInTheDocument();
  });

  it('shows send button when not loading', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const sendButton = screen.getByTitle('Enviar mensaje');
    expect(sendButton).toBeInTheDocument();
  });

  it('handles paste event', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    const pasteEvent = new Event('paste', { bubbles: true });
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: () => 'Pasted text'
      }
    });
    
    fireEvent(input, pasteEvent);
    
    // The component should handle paste events
    expect(input).toBeInTheDocument();
  });

  it('handles input focus', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.focus(input);
    
    // Input should be focused
    expect(input).toHaveFocus();
  });

  it('handles input blur', () => {
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.blur(input);
    
    // Input should be blurred
    expect(input).not.toHaveFocus();
  });
});