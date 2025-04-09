package com.carrent.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        public WebConfig() {
                // Construtor vazio
        }

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOrigins("*")
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                                .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin",
                                                "Cache-Control", "Pragma", "Expires")
                                .exposedHeaders("Authorization")
                                .maxAge(3600);
        }

        @Override
        public void addInterceptors(@NonNull InterceptorRegistry registry) {
                // Interceptors foram removidos para evitar erros de compilação
        }

        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                // Deixe o Spring Boot gerenciar os recursos automaticamente
        }

        @Override
        public void addViewControllers(@NonNull ViewControllerRegistry registry) {
                // Configuração para lidar com erros 404
                registry.addViewController("/error").setViewName("forward:/");
        }
}