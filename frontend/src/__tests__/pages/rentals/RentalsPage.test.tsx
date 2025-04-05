import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RentalsPage } from '../../../pages/rentals/RentalsPage';
import { useRentals } from '../../../hooks/useRentals';
import { RentalStatus } from '../../../types/rental';

// Mock dos hooks
jest.mock('../../../hooks/useRentals');
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}));

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

describe('RentalsPage', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    (useRentals as jest.Mock).mockReturnValue({
      rentals: mockRentals,
      createRental: { mutateAsync: mockMutateAsync },
      updateRental: { mutateAsync: mockMutateAsync },
      deleteRental: { mutateAsync: mockMutateAsync },
      startRental: { mutateAsync: mockMutateAsync },
      completeRental: { mutateAsync: mockMutateAsync },
      cancelRental: { mutateAsync: mockMutateAsync }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a página corretamente', () => {
    render(<RentalsPage />);

    expect(screen.getByText('Aluguéis')).toBeInTheDocument();
    expect(screen.getByText('Novo Aluguel')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('deve abrir o formulário ao clicar em Novo Aluguel', () => {
    render(<RentalsPage />);

    const addButton = screen.getByText('Novo Aluguel');
    fireEvent.click(addButton);

    expect(screen.getByText('Novo Aluguel')).toBeInTheDocument();
    expect(screen.getByLabelText('Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Veículo')).toBeInTheDocument();
  });

  it('deve abrir o formulário de edição ao clicar em Editar', () => {
    render(<RentalsPage />);

    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);

    expect(screen.getByText('Editar Aluguel')).toBeInTheDocument();
    expect(screen.getByLabelText('Cliente')).toHaveValue('1');
    expect(screen.getByLabelText('Veículo')).toHaveValue('1');
  });

  it('deve abrir o diálogo de confirmação ao clicar em Excluir', () => {
    render(<RentalsPage />);

    const deleteButton = screen.getAllByTitle('Excluir')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir o aluguel/)).toBeInTheDocument();
  });

  it('deve chamar startRental ao clicar em Iniciar', async () => {
    render(<RentalsPage />);

    const startButton = screen.getAllByTitle('Iniciar')[0];
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(1);
    });
  });

  it('deve chamar completeRental ao clicar em Concluir', async () => {
    render(<RentalsPage />);

    const completeButton = screen.getAllByTitle('Concluir')[0];
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(2);
    });
  });

  it('deve chamar cancelRental ao clicar em Cancelar', async () => {
    render(<RentalsPage />);

    const cancelButton = screen.getAllByTitle('Cancelar')[0];
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(1);
    });
  });

  it('deve chamar createRental ao submeter o formulário de novo aluguel', async () => {
    render(<RentalsPage />);

    // Abre o formulário
    const addButton = screen.getByText('Novo Aluguel');
    fireEvent.click(addButton);

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Veículo'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Data de Início'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('Data de Fim'), { target: { value: '2024-04-05' } });

    // Submete o formulário
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        customerId: 1,
        vehicleId: 1,
        startDate: '2024-04-01',
        endDate: '2024-04-05'
      });
    });
  });

  it('deve chamar updateRental ao submeter o formulário de edição', async () => {
    render(<RentalsPage />);

    // Abre o formulário de edição
    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);

    // Altera os valores
    fireEvent.change(screen.getByLabelText('Data de Fim'), { target: { value: '2024-04-06' } });

    // Submete o formulário
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        customerId: 1,
        vehicleId: 1,
        startDate: '2024-04-01',
        endDate: '2024-04-06'
      });
    });
  });

  it('deve chamar deleteRental ao confirmar a exclusão', async () => {
    render(<RentalsPage />);

    // Abre o diálogo de confirmação
    const deleteButton = screen.getAllByTitle('Excluir')[0];
    fireEvent.click(deleteButton);

    // Confirma a exclusão
    const confirmButton = screen.getByText('Excluir');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(1);
    });
  });
}); 