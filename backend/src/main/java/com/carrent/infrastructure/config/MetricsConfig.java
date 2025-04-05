package com.carrent.infrastructure.config;

import com.carrent.infrastructure.metrics.CustomMetricsService;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

@Configuration
public class MetricsConfig {

    private final CustomMetricsService metricsService;

    public MetricsConfig(CustomMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void initializeMetrics() {
        metricsService.initializeMetrics();
    }
}