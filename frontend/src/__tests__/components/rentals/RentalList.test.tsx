import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RentalList } from '../../../components/rentals/RentalList';
import { useRentals } from '../../../hooks/useRentals';
import { RentalStatus } from '../../../types/rental';

// Mock do hook useRentals
jest.mock('../../../hooks/useRentals');

const mockRentals = {
  data: [
    {
      id: 1,
      customer: { id: 1, name: 'João Silva', document: '123.456.789-00' },
      vehicle: { id: 1, brand: 'Toyota', model: 'Corolla', plate: 'ABC-1234' },
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      totalAmount: 500,
      status: RentalStatus.PENDING
    },
    {
      id: 2,
      customer: { id: 2, name: 'Maria Santos', document: '987.654.321-00' },
      vehicle: { id: 2, brand: 'Honda', model: 'Civic', plate: 'XYZ-5678' },
      startDate: '2024-04-02',
      endDate: '2024-04-07',
      totalAmount: 750,
      status: RentalStatus.ACTIVE
    }
  ],
  isLoading: false,
  isError: false
};

describe('RentalList', () => {
  const mockHandlers = {
    onAdd: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStart: jest.fn(),
    onComplete: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    (useRentals as jest.Mock).mockReturnValue(mockRentals);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a lista de aluguéis corretamente', () => {
    render(<RentalList {...mockHandlers} />);

    // Verifica se os elementos principais estão presentes
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de carregamento quando isLoading é true', () => {
    (useRentals as jest.Mock).mockReturnValue({ ...mockRentals, isLoading: true });
    render(<RentalList {...mockHandlers} />);
    expect(screen.getByText('Carregando aluguéis...')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando isError é true', () => {
    (useRentals as jest.Mock).mockReturnValue({ ...mockRentals, isError: true });
    render(<RentalList {...mockHandlers} />);
    expect(screen.getByText('Erro ao carregar aluguéis. Tente novamente mais tarde.')).toBeInTheDocument();
  });

  it('deve filtrar aluguéis por termo de busca', () => {
    render(<RentalList {...mockHandlers} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar');
    fireEvent.change(searchInput, { target: { value: 'João' } });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
  });

  it('deve filtrar aluguéis por status', () => {
    render(<RentalList {...mockHandlers} />);
    
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: RentalStatus.ACTIVE } });

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  it('deve chamar onStart quando o botão de iniciar é clicado', () => {
    render(<RentalList {...mockHandlers} />);
    
    const startButton = screen.getAllByTitle('Iniciar')[0];
    fireEvent.click(startButton);

    expect(mockHandlers.onStart).toHaveBeenCalledWith(mockRentals.data[0]);
  });

  it('deve chamar onComplete quando o botão de finalizar é clicado', () => {
    render(<RentalList {...mockHandlers} />);
    
    const completeButton = screen.getAllByTitle('Concluir')[0];
    fireEvent.click(completeButton);

    expect(mockHandlers.onComplete).toHaveBeenCalledWith(mockRentals.data[1]);
  });

  it('deve chamar onCancel quando o botão de cancelar é clicado', () => {
    render(<RentalList {...mockHandlers} />);
    
    const cancelButton = screen.getAllByTitle('Cancelar')[0];
    fireEvent.click(cancelButton);

    expect(mockHandlers.onCancel).toHaveBeenCalledWith(mockRentals.data[0]);
  });

  it('deve chamar onEdit quando o botão de editar é clicado', () => {
    render(<RentalList {...mockHandlers} />);
    
    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockRentals.data[0]);
  });

  it('deve chamar onDelete quando o botão de excluir é clicado', () => {
    render(<RentalList {...mockHandlers} />);
    
    const deleteButton = screen.getAllByTitle('Excluir')[0];
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockRentals.data[0]);
  });
}); 