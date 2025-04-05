import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RentalForm } from '../../../components/rentals/RentalForm';
import { useCustomers } from '../../../hooks/useCustomers';
import { useVehicles } from '../../../hooks/useVehicles';
import { RentalStatus } from '../../../types/rental';

// Mock dos hooks
jest.mock('../../../hooks/useCustomers');
jest.mock('../../../hooks/useVehicles');

const mockCustomers = {
  data: [
    { id: 1, name: 'João Silva', document: '123.456.789-00' },
    { id: 2, name: 'Maria Santos', document: '987.654.321-00' }
  ],
  isLoading: false,
  isError: false
};

const mockVehicles = {
  data: [
    { id: 1, brand: 'Toyota', model: 'Corolla', plate: 'ABC-1234', dailyRate: 100 },
    { id: 2, brand: 'Honda', model: 'Civic', plate: 'XYZ-5678', dailyRate: 150 }
  ],
  isLoading: false,
  isError: false
};

describe('RentalForm', () => {
  const mockHandlers = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    title: 'Novo Aluguel'
  };

  beforeEach(() => {
    (useCustomers as jest.Mock).mockReturnValue(mockCustomers);
    (useVehicles as jest.Mock).mockReturnValue(mockVehicles);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<RentalForm {...mockHandlers} />);

    expect(screen.getByText('Novo Aluguel')).toBeInTheDocument();
    expect(screen.getByLabelText('Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Veículo')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de Início')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de Fim')).toBeInTheDocument();
  });

  it('deve preencher o formulário com valores iniciais quando for edição', () => {
    const initialValues = {
      id: 1,
      customerId: 1,
      vehicleId: 1,
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      totalAmount: 500,
      status: RentalStatus.PENDING
    };

    render(<RentalForm {...mockHandlers} initialValues={initialValues} />);

    expect(screen.getByLabelText('Cliente')).toHaveValue('1');
    expect(screen.getByLabelText('Veículo')).toHaveValue('1');
    expect(screen.getByLabelText('Data de Início')).toHaveValue('2024-04-01');
    expect(screen.getByLabelText('Data de Fim')).toHaveValue('2024-04-05');
  });

  it('deve mostrar erro quando campos obrigatórios não são preenchidos', async () => {
    render(<RentalForm {...mockHandlers} />);

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cliente é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Veículo é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Data de início é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Data de fim é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro quando a data de fim é anterior à data de início', async () => {
    render(<RentalForm {...mockHandlers} />);

    // Seleciona cliente e veículo
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Veículo'), { target: { value: '1' } });

    // Define datas inválidas
    fireEvent.change(screen.getByLabelText('Data de Início'), { target: { value: '2024-04-05' } });
    fireEvent.change(screen.getByLabelText('Data de Fim'), { target: { value: '2024-04-01' } });

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Data de fim deve ser posterior à data de início')).toBeInTheDocument();
    });
  });

  it('deve calcular o valor total corretamente', async () => {
    render(<RentalForm {...mockHandlers} />);

    // Seleciona cliente e veículo
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Veículo'), { target: { value: '1' } });

    // Define datas válidas (5 dias)
    fireEvent.change(screen.getByLabelText('Data de Início'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('Data de Fim'), { target: { value: '2024-04-05' } });

    await waitFor(() => {
      expect(screen.getByText('R$ 500,00')).toBeInTheDocument(); // 5 dias * R$ 100,00
    });
  });

  it('deve chamar onSubmit com os valores corretos quando o formulário é válido', async () => {
    render(<RentalForm {...mockHandlers} />);

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Veículo'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Data de Início'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('Data de Fim'), { target: { value: '2024-04-05' } });

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        customerId: 1,
        vehicleId: 1,
        startDate: '2024-04-01',
        endDate: '2024-04-05'
      });
    });
  });

  it('deve chamar onClose quando o botão cancelar é clicado', () => {
    render(<RentalForm {...mockHandlers} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
  });
}); 