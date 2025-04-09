package com.carrent.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "rentals")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinColumn(name = "vehicle_id", nullable = false)
    @NotNull(message = "O veículo é obrigatório")
    @ToString.Exclude
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @NotNull(message = "O cliente é obrigatório")
    @ToString.Exclude
    private Customer customer;

    @Column(name = "start_date", nullable = false)
    @NotNull(message = "A data de início é obrigatória")
    @Future(message = "A data de início deve ser futura")
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    @NotNull(message = "A data de término é obrigatória")
    @Future(message = "A data de término deve ser futura")
    private LocalDateTime endDate;

    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "O status é obrigatório")
    private RentalStatus status;

    @Column(name = "total_amount", nullable = false)
    @NotNull(message = "O valor total é obrigatório")
    @Positive(message = "O valor total deve ser positivo")
    private BigDecimal totalAmount;

    @Column(name = "original_total_amount")
    private BigDecimal originalTotalAmount;

    @Column(name = "early_termination_fee")
    private BigDecimal earlyTerminationFee;

    @Column(name = "ended_early")
    private Boolean endedEarly = false;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Override
    public final boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null)
            return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy
                ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
                : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
                : this.getClass();
        if (thisEffectiveClass != oEffectiveClass)
            return false;
        Rental rental = (Rental) o;
        return getId() != null && Objects.equals(getId(), rental.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}