// InventoryViewModel.swift
// Main view model for managing inventory data

import SwiftUI
import FirebaseFirestore
import Combine

@MainActor
class InventoryViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var currentSession: [SessionItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var lastScannedItem: Item?
    @Published var showQuantityInput = false
    
    private var db = Firestore.firestore()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        fetchItems()
    }
    
    // MARK: - Catalog Operations
    
    func fetchItems() {
        isLoading = true
        
        db.collection("items")
            .order(by: "name")
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                    return
                }
                
                self.items = snapshot?.documents.compactMap { doc in
                    try? doc.data(as: Item.self)
                } ?? []
                
                self.isLoading = false
            }
    }
    
    func lookupItem(bySKU sku: String) -> Item? {
        return items.first { $0.sku.lowercased() == sku.lowercased() }
    }
    
    // MARK: - Session Operations
    
    func addToSession(item: Item, quantity: Int) {
        if let index = currentSession.firstIndex(where: { $0.item.id == item.id }) {
            currentSession[index].quantity += quantity
        } else {
            let sessionItem = SessionItem(item: item, quantity: quantity, scannedAt: Date())
            currentSession.append(sessionItem)
        }
    }
    
    func updateQuantity(for sessionItem: SessionItem, newQuantity: Int) {
        if let index = currentSession.firstIndex(where: { $0.id == sessionItem.id }) {
            currentSession[index].quantity = newQuantity
        }
    }
    
    func removeFromSession(sessionItem: SessionItem) {
        currentSession.removeAll { $0.id == sessionItem.id }
    }
    
    func clearSession() {
        currentSession.removeAll()
    }
    
    // MARK: - Export
    
    func exportToCSV() -> URL? {
        guard !currentSession.isEmpty else { return nil }
        
        var csvString = "SKU,Name,Category,Quantity,ScannedAt\n"
        
        for sessionItem in currentSession {
            let item = sessionItem.item
            let dateFormatter = ISO8601DateFormatter()
            let dateString = dateFormatter.string(from: sessionItem.scannedAt)
            
            csvString += "\"\(item.sku)\",\"\(item.name)\",\"\(item.category)\",\(sessionItem.quantity),\"\(dateString)\"\n"
        }
        
        let filename = "inventory_session_\(Date().timeIntervalSince1970).csv"
        let path = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        
        do {
            try csvString.write(to: path, atomically: true, encoding: .utf8)
            return path
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }
    
    // MARK: - Cloud Sync
    
    func saveSessionToCloud(notes: String? = nil) async {
        guard !currentSession.isEmpty else { return }
        
        let session = ScanSession(
            startedAt: Date(),
            completedAt: Date(),
            items: currentSession,
            notes: notes
        )
        
        do {
            _ = try await db.collection("sessions").addDocument(from: session)
            clearSession()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}