package com.carrent.infrastructure.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class CustomMetricsService {

    private final MeterRegistry registry;
    private final AtomicInteger activeRentals = new AtomicInteger(0);
    private final AtomicInteger availableVehicles = new AtomicInteger(0);

    public void initializeMetrics() {
        // Contador de locações ativas
        Gauge.builder("carrent.rentals.active", activeRentals, AtomicInteger::get)
                .description("Número de locações ativas")
                .tag("type", "active")
                .register(registry);

        // Contador de veículos disponíveis
        Gauge.builder("carrent.vehicles.available", availableVehicles, AtomicInteger::get)
                .description("Número de veículos disponíveis")
                .tag("type", "available")
                .register(registry);

        // Contador de tentativas de autenticação
        Counter.builder("carrent.auth.attempts")
                .description("Número de tentativas de autenticação")
                .tag("type", "total")
                .register(registry);

        // Contador de falhas de autenticação
        Counter.builder("carrent.auth.failures")
                .description("Número de falhas de autenticação")
                .tag("type", "failed")
                .register(registry);

        // Contador de requisições HTTP
        Counter.builder("carrent.http.requests")
                .description("Número total de requisições HTTP")
                .tag("type", "total")
                .register(registry);

        // Contador de erros HTTP
        Counter.builder("carrent.http.errors")
                .description("Número de erros HTTP")
                .tag("type", "errors")
                .register(registry);
    }

    public void incrementActiveRentals() {
        activeRentals.incrementAndGet();
    }

    public void decrementActiveRentals() {
        activeRentals.decrementAndGet();
    }

    public void setAvailableVehicles(int count) {
        availableVehicles.set(count);
    }

    public void incrementAuthAttempts() {
        registry.counter("carrent.auth.attempts").increment();
    }

    public void incrementAuthFailures() {
        registry.counter("carrent.auth.failures").increment();
    }

    public void incrementHttpRequests() {
        registry.counter("carrent.http.requests").increment();
    }

    public void incrementHttpErrors() {
        registry.counter("carrent.http.errors").increment();
    }
}