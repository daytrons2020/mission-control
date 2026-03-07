// CatalogView.swift
// View for browsing the item catalog

import SwiftUI

struct CatalogView: View {
    @ObservedObject var viewModel: InventoryViewModel
    @State private var searchText = ""
    @State private var selectedCategory: String?
    
    var filteredItems: [Item] {
        var items = viewModel.items
        
        if !searchText.isEmpty {
            items = items.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.sku.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        if let category = selectedCategory {
            items = items.filter { $0.category == category }
        }
        
        return items
    }
    
    var categories: [String] {
        Array(Set(viewModel.items.map { $0.category })).sorted()
    }
    
    var body: some View {
        NavigationView {
            List {
                if viewModel.isLoading {
                    Section {
                        ProgressView()
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding()
                    }
                } else {
                    // Category filter
                    if categories.count > 1 {
                        Section("Categories") {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    FilterChip(
                                        title: "All",
                                        isSelected: selectedCategory == nil
                                    ) {
                                        selectedCategory = nil
                                    }
                                    
                                    ForEach(categories, id: \.self) { category in
                                        FilterChip(
                                            title: category,
                                            isSelected: selectedCategory == category
                                        ) {
                                            selectedCategory = category
                                        }
                                    }
                                }
                                .padding(.horizontal, 4)
                            }
                        }
                    }
                    
                    Section("Items (\(filteredItems.count))") {
                        ForEach(filteredItems) { item in
                            CatalogItemRow(item: item)
                        }
                    }
                }
            }
            .navigationTitle("Catalog")
            .searchable(text: $searchText, prompt: "Search items...")
            .refreshable {
                viewModel.fetchItems()
            }
        }
    }
}

struct CatalogItemRow: View {
    let item: Item
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(item.name)
                .font(.headline)
            
            HStack {
                Text(item.sku)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(4)
                
                Spacer()
                
                Text(item.category)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}

#Preview {
    CatalogView(viewModel: InventoryViewModel())
}