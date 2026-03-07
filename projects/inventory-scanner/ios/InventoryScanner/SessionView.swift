// SessionView.swift
// View for managing current scanning session

import SwiftUI
import UniformTypeIdentifiers

struct SessionView: View {
    @ObservedObject var viewModel: InventoryViewModel
    @State private var showExportSheet = false
    @State private var showClearConfirmation = false
    @State private var exportURL: URL?
    @State private var editingItem: SessionItem?
    @State private var editQuantity = ""
    
    var body: some View {
        NavigationView {
            List {
                if viewModel.currentSession.isEmpty {
                    Section {
                        Text("No items scanned yet")
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding()
                    }
                } else {
                    Section("Scanned Items (\(viewModel.currentSession.count))") {
                        ForEach(viewModel.currentSession) { sessionItem in
                            SessionItemRow(sessionItem: sessionItem)
                                .swipeActions(edge: .trailing) {
                                    Button(role: .destructive) {
                                        viewModel.removeFromSession(sessionItem: sessionItem)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                    
                                    Button {
                                        editingItem = sessionItem
                                        editQuantity = String(sessionItem.quantity)
                                    } label: {
                                        Label("Edit", systemImage: "pencil")
                                    }
                                    .tint(.blue)
                                }
                        }
                    }
                    
                    Section {
                        HStack {
                            Text("Total Items")
                                .fontWeight(.semibold)
                            Spacer()
                            Text("\(totalQuantity)")
                                .fontWeight(.bold)
                        }
                    }
                }
            }
            .navigationTitle("Current Session")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if !viewModel.currentSession.isEmpty {
                        Button {
                            showClearConfirmation = true
                        } label: {
                            Text("Clear")
                                .foregroundColor(.red)
                        }
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !viewModel.currentSession.isEmpty {
                        Button {
                            exportSession()
                        } label: {
                            Image(systemName: "square.and.arrow.up")
                        }
                    }
                }
            }
            .confirmationDialog("Clear Session?", isPresented: $showClearConfirmation, titleVisibility: .visible) {
                Button("Clear All Items", role: .destructive) {
                    viewModel.clearSession()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will remove all scanned items from the current session.")
            }
            .sheet(isPresented: $showExportSheet) {
                if let url = exportURL {
                    ShareSheet(items: [url])
                }
            }
            .alert("Edit Quantity", isPresented: .constant(editingItem != nil)) {
                TextField("Quantity", text: $editQuantity)
                    .keyboardType(.numberPad)
                Button("Cancel", role: .cancel) {
                    editingItem = nil
                }
                Button("Save") {
                    if let item = editingItem, let newQty = Int(editQuantity), newQty > 0 {
                        viewModel.updateQuantity(for: item, newQuantity: newQty)
                    }
                    editingItem = nil
                }
            } message: {
                if let item = editingItem {
                    Text("Update quantity for \(item.item.name)")
                }
            }
        }
    }
    
    private var totalQuantity: Int {
        viewModel.currentSession.reduce(0) { $0 + $1.quantity }
    }
    
    private func exportSession() {
        if let url = viewModel.exportToCSV() {
            exportURL = url
            showExportSheet = true
        }
    }
}

struct SessionItemRow: View {
    let sessionItem: SessionItem
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(sessionItem.item.name)
                    .font(.headline)
                Text(sessionItem.item.sku)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(sessionItem.item.category)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text("× \(sessionItem.quantity)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text(sessionItem.scannedAt, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    var items: [Any]
    var activities: [UIActivity]? = nil
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: items, applicationActivities: activities)
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    SessionView(viewModel: InventoryViewModel())
}