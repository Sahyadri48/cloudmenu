package com.cloudmenu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_plan", nullable = false)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.BASIC;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
 // ---- Profile fields (all optional / nullable) ----
    private String ownerName;
    private String phone;

    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String description;

    private String address;
    private String city;
    private String state;
    private String zip;

    @jakarta.persistence.Column(columnDefinition = "JSON")
    private String operatingHoursJson;

    private Double taxRate;
    private Double serviceFee;
    private String currency;

    private Boolean deliveryEnabled;
    private Boolean takeoutEnabled;

    // getters/setters
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZip() { return zip; }
    public void setZip(String zip) { this.zip = zip; }

    public String getOperatingHoursJson() { return operatingHoursJson; }
    public void setOperatingHoursJson(String operatingHoursJson) { this.operatingHoursJson = operatingHoursJson; }

    public Double getTaxRate() { return taxRate; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }

    public Double getServiceFee() { return serviceFee; }
    public void setServiceFee(Double serviceFee) { this.serviceFee = serviceFee; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getDeliveryEnabled() { return deliveryEnabled; }
    public void setDeliveryEnabled(Boolean deliveryEnabled) { this.deliveryEnabled = deliveryEnabled; }

    public Boolean getTakeoutEnabled() { return takeoutEnabled; }
    public void setTakeoutEnabled(Boolean takeoutEnabled) { this.takeoutEnabled = takeoutEnabled; }


    public enum SubscriptionPlan {
       Free, BASIC, PROFESSIONAL, ENTERPRISE
    }
}
