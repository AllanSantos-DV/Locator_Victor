import { render, screen, fireEvent } from '@testing-library/react';
import RentalDeleteDialog from '../../../components/rentals/RentalDeleteDialog';
import { Rental, RentalStatus } from '../../../types/rental';
import { Vehicle } from '../../../types/vehicle';

const mockRental: Rental = {
  id: 1,
  customerId: 1,
  vehicleId: 1,
  startDate: '2024-02-20T00:00:00.000Z',
  endDate: '2024-02-27T00:00:00.000Z',
  totalAmount: 1000,
  status: RentalStatus.PENDING,
  createdAt: '2024-02-20T00:00:00.000Z',
  updatedAt: '2024-02-20T00:00:00.000Z',
  customer: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  },
  vehicle: {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    plate: 'ABC1234'
  }
};

const mockHandlers = {
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  rental: mockRental
};

describe('RentalDeleteDialog', () => {
  it('should render correctly', () => {
    render(<RentalDeleteDialog {...mockHandlers} />);
    
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir o aluguel/i)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<RentalDeleteDialog {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<RentalDeleteDialog {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Confirmar'));
    expect(mockHandlers.onConfirm).toHaveBeenCalled();
  });

  it('should handle null rental', () => {
    render(<RentalDeleteDialog {...mockHandlers} rental={null} />);
    
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir o aluguel/i)).toBeInTheDocument();
  });
}); 