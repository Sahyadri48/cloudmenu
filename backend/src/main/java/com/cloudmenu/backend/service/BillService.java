package com.cloudmenu.backend.service;

import com.cloudmenu.backend.dto.BillDTO;
import com.cloudmenu.backend.entity.Bill;
import com.cloudmenu.backend.repository.BillRepository;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

@Service
public class BillService {
    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public BillDTO createBill(BillDTO dto) {
        Bill bill = new Bill();
        bill.setOrderId(dto.orderId());
        bill.setSubtotal(dto.subtotal());
        bill.setTax(dto.tax());
        bill.setServiceFee(dto.serviceFee());
        bill.setTotalAmount(dto.totalAmount());
        billRepository.save(bill);
        return new BillDTO(bill.getId(), bill.getOrderId(), bill.getSubtotal(), bill.getTax(),
                bill.getServiceFee(), bill.getTotalAmount(), bill.getStatus().name());
    }

    public BillDTO getBillByOrder(Integer orderId) {
        Bill bill = billRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        return new BillDTO(bill.getId(), bill.getOrderId(), bill.getSubtotal(), bill.getTax(),
                bill.getServiceFee(), bill.getTotalAmount(), bill.getStatus().name());
    }

    public void updateBillStatus(Integer billId, String status, LocalDateTime printedAt) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        bill.setStatus(Bill.Status.valueOf(status));
        if (printedAt != null) {
            bill.setPrintedAt(printedAt);
        }
        billRepository.save(bill);
    }
}