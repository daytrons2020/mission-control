// ContentView.swift
// Main tab view

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = InventoryViewModel()
    
    var body: some View {
        TabView {
            ScannerView(viewModel: viewModel)
                .tabItem {
                    Label("Scan", systemImage: "barcode.viewfinder")
                }
            
            SessionView(viewModel: viewModel)
                .tabItem {
                    Label("Session", systemImage: "list.bullet")
                }
            
            CatalogView(viewModel: viewModel)
                .tabItem {
                    Label("Catalog", systemImage: "archivebox")
                }
        }
    }
}

#Preview {
    ContentView()
}