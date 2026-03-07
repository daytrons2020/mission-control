// Models.swift
// Data models for the app

import Foundation
import FirebaseFirestore

struct Item: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    var sku: String
    var name: String
    var category: String
    var createdAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case sku
        case name
        case category
        case createdAt
    }
}

struct SessionItem: Identifiable, Codable, Equatable {
    var id = UUID()
    var item: Item
    var quantity: Int
    var scannedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case item
        case quantity
        case scannedAt
    }
}

struct ScanSession: Identifiable, Codable {
    @DocumentID var id: String?
    var startedAt: Date
    var completedAt: Date?
    var items: [SessionItem]
    var notes: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case startedAt
        case completedAt
        case items
        case notes
    }
}