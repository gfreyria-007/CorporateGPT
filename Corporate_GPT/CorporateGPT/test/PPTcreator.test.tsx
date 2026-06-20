/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PPTcreator } from '../src/components/PPTcreator';
import * as geminiService from '../src/services/geminiService';

// Mock geminiService
jest.mock('../src/services/geminiService');
const mockGenerateDeepResearch = geminiService.generateDeepResearch as jest.MockedFunction<typeof geminiService.generateDeepResearch>;
const mockGenerateSkeleton = geminiService.generateSkeleton as jest.MockedFunction<typeof geminiService.generateSkeleton>;

const mockProps = {
  onClose: jest.fn(),
  theme: 'dark',
  lang: 'es',
  user: { id: 'test-user', name: 'Test User' },
  isMobile: false
};

describe('PPTcreator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateDeepResearch.mockResolvedValue([]);
    mockGenerateSkeleton.mockResolvedValue([]);
  });

  it('renders correctly', () => {
    render(<PPTcreator {...mockProps} />);
    expect(screen.getByText('Crear Presentación')).toBeInTheDocument();
  });

  it('handles stage 1: scope and content', () => {
    render(<PPTcreator {...mockProps} />);
    
    const slideCountInput = screen.getByLabelText('Número de diapositivas');
    fireEvent.change(slideCountInput, { target: { value: '5' } });
    
    expect(slideCountInput).toHaveValue(5);
  });

  it('handles content input', () => {
    render(<PPTcreator {...mockProps} />);
    
    const contentInput = screen.getByPlaceholderText('Escribe el contenido de tu presentación...');
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    
    expect(contentInput).toHaveValue('Test content');
  });

  it('handles audience input', () => {
    render(<PPTcreator {...mockProps} />);
    
    const audienceInput = screen.getByPlaceholderText('¿Para quién es esta presentación?');
    fireEvent.change(audienceInput, { target: { value: 'Ejecutivos' } });
    
    expect(audienceInput).toHaveValue('Ejecutivos');
  });

  it('handles tone selection', () => {
    render(<PPTcreator {...mockProps} />);
    
    const toneSelect = screen.getByDisplayValue('Profesional');
    fireEvent.change(toneSelect, { target: { value: 'casual' } });
    
    expect(toneSelect).toHaveValue('casual');
  });

  it('handles key takeaway input', () => {
    render(<PPTcreator {...mockProps} />);
    
    const takeawayInput = screen.getByPlaceholderText('¿Cuál es el mensaje principal?');
    fireEvent.change(takeawayInput, { target: { value: 'El mensaje principal es...' } });
    
    expect(takeawayInput).toHaveValue('El mensaje principal es...');
  });

  it('generates research', async () => {
    render(<PPTcreator {...mockProps} />);
    
    const generateButton = screen.getByText('Generar Investigación');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockGenerateDeepResearch).toHaveBeenCalled();
    });
  });

  it('generates slides', async () => {
    render(<PPTcreator {...mockProps} />);
    
    // Set some content first
    const contentInput = screen.getByPlaceholderText('Escribe el contenido de tu presentación...');
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    
    const generateButton = screen.getByText('Generar Diapositivas');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockGenerateSkeleton).toHaveBeenCalled();
    });
  });

  it('handles style selection', () => {
    render(<PPTcreator {...mockProps} />);
    
    const styleSelect = screen.getByDisplayValue('Profesional');
    fireEvent.change(styleSelect, { target: { value: 'creative' } });
    
    expect(styleSelect).toHaveValue('creative');
  });

  it('handles mobile view', () => {
    const mobileProps = { ...mockProps, isMobile: true };
    render(<PPTcreator {...mobileProps} />);
    
    // Should render mobile-specific elements
    expect(screen.getByText('Crear Presentación')).toBeInTheDocument();
  });

  it('handles theme switching', () => {
    const lightThemeProps = { ...mockProps, theme: 'light' };
    render(<PPTcreator {...lightThemeProps} />);
    
    expect(screen.getByText('Crear Presentación')).toBeInTheDocument();
  });

  it('handles language switching', () => {
    const englishProps = { ...mockProps, lang: 'en' };
    render(<PPTcreator {...englishProps} />);
    
    expect(screen.getByText('Create Presentation')).toBeInTheDocument();
  });

  it('handles close functionality', () => {
    render(<PPTcreator {...mockProps} />);
    
    const closeButton = screen.getByTitle('Cerrar');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles loading states', async () => {
    mockGenerateDeepResearch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<PPTcreator {...mockProps} />);
    
    const generateButton = screen.getByText('Generar Investigación');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generando...')).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    mockGenerateDeepResearch.mockRejectedValue(new Error('Research failed'));
    
    render(<PPTcreator {...mockProps} />);
    
    const generateButton = screen.getByText('Generar Investigación');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error al generar la investigación')).toBeInTheDocument();
    });
  });
});