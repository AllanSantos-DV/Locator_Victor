package com.carrent.mocks;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.service.RentalService;
import com.carrent.domain.entity.RentalStatus;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Primary
public class RentalServiceMock extends RentalService {

    public RentalServiceMock() {
        super(null, null, null, null, null);
    }

    @Override
    public void cancelRental(Long id) {
        // Mock implementation that does nothing
    }

    @Override
    public List<RentalDTO> findAll() {
        return List.of();
    }

    @Override
    public RentalDTO findById(Long id) {
        return null;
    }

    @Override
    public RentalDTO create(RentalDTO rentalDTO) {
        return rentalDTO;
    }

    @Override
    public RentalDTO update(Long id, RentalDTO rentalDTO) {
        return rentalDTO;
    }

    @Override
    public void startRental(Long id) {
        // Mock implementation that does nothing
    }

    @Override
    public void completeRental(Long id) {
        // Mock implementation that does nothing
    }

    @Override
    public void terminateRentalEarly(Long id) {
        // Mock implementation that does nothing
    }
}