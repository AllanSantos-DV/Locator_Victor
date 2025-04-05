package com.carrent.infrastructure.config;

import com.carrent.web.dto.ErrorResponse;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("API de Locação de Veículos")
                                                .description("API para gerenciamento de locação de veículos")
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("Equipe de Desenvolvimento")
                                                                .email("suporte@carrent.com"))
                                                .license(new License()
                                                                .name("Apache 2.0")
                                                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")))
                                .servers(List.of(
                                                new Server()
                                                                .url("http://localhost:8080/api")
                                                                .description("Servidor de Desenvolvimento")))
                                .components(new Components()
                                                .addResponses("BadRequest", new ApiResponse()
                                                                .description("Requisição inválida")
                                                                .content(new Content()
                                                                                .addMediaType("application/json",
                                                                                                new MediaType()
                                                                                                                .schema(new Schema<ErrorResponse>()
                                                                                                                                .$ref("#/components/schemas/ErrorResponse")))))
                                                .addResponses("NotFound", new ApiResponse()
                                                                .description("Recurso não encontrado")
                                                                .content(new Content()
                                                                                .addMediaType("application/json",
                                                                                                new MediaType()
                                                                                                                .schema(new Schema<ErrorResponse>()
                                                                                                                                .$ref("#/components/schemas/ErrorResponse")))))
                                                .addResponses("Conflict", new ApiResponse()
                                                                .description("Conflito")
                                                                .content(new Content()
                                                                                .addMediaType("application/json",
                                                                                                new MediaType()
                                                                                                                .schema(new Schema<ErrorResponse>()
                                                                                                                                .$ref("#/components/schemas/ErrorResponse")))))
                                                .addResponses("TooManyRequests", new ApiResponse()
                                                                .description("Muitas requisições")
                                                                .content(new Content()
                                                                                .addMediaType("application/json",
                                                                                                new MediaType()
                                                                                                                .schema(new Schema<ErrorResponse>()
                                                                                                                                .$ref("#/components/schemas/ErrorResponse")))))
                                                .addResponses("InternalServerError", new ApiResponse()
                                                                .description("Erro interno do servidor")
                                                                .content(new Content()
                                                                                .addMediaType("application/json",
                                                                                                new MediaType()
                                                                                                                .schema(new Schema<ErrorResponse>()
                                                                                                                                .$ref("#/components/schemas/ErrorResponse"))))));
        }
}