// ScannerView.swift
// Barcode/QR scanner view

import SwiftUI
import AVFoundation

struct ScannerView: View {
    @ObservedObject var viewModel: InventoryViewModel
    @State private var scannedCode: String?
    @State private var showQuantitySheet = false
    @State private var scannedItem: Item?
    
    var body: some View {
        NavigationView {
            ZStack {
                ScannerOverlayView { code in
                    handleScannedCode(code)
                }
                .ignoresSafeArea()
                
                VStack {
                    Spacer()
                    
                    Text("Position barcode within frame")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .cornerRadius(10)
                        .padding(.bottom, 100)
                }
            }
            .navigationTitle("Scan Item")
            .sheet(isPresented: $showQuantitySheet) {
                if let item = scannedItem {
                    QuantityInputView(item: item) { quantity in
                        viewModel.addToSession(item: item, quantity: quantity)
                        scannedItem = nil
                    }
                }
            }
        }
    }
    
    private func handleScannedCode(_ code: String) {
        guard scannedCode != code else { return }
        scannedCode = code
        
        if let item = viewModel.lookupItem(bySKU: code) {
            scannedItem = item
            showQuantitySheet = true
        } else {
            viewModel.errorMessage = "Item not found: \(code)"
        }
        
        // Reset after delay to allow re-scanning
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            scannedCode = nil
        }
    }
}

// MARK: - Scanner Overlay (UIViewRepresentable)

struct ScannerOverlayView: UIViewControllerRepresentable {
    var onCodeScanned: (String) -> Void
    
    func makeUIViewController(context: Context) -> ScannerViewController {
        let controller = ScannerViewController()
        controller.onCodeScanned = onCodeScanned
        return controller
    }
    
    func updateUIViewController(_ uiViewController: ScannerViewController, context: Context) {}
}

class ScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onCodeScanned: ((String) -> Void)?
    var captureSession: AVCaptureSession!
    var previewLayer: AVCaptureVideoPreviewLayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .black
        captureSession = AVCaptureSession()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else { return }
        let videoInput: AVCaptureDeviceInput
        
        do {
            videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
        } catch {
            return
        }
        
        if captureSession.canAddInput(videoInput) {
            captureSession.addInput(videoInput)
        } else {
            failed()
            return
        }
        
        let metadataOutput = AVCaptureMetadataOutput()
        
        if captureSession.canAddOutput(metadataOutput) {
            captureSession.addOutput(metadataOutput)
            
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.ean8, .ean13, .pdf417, .qr, .code128, .code39]
        } else {
            failed()
            return
        }
        
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.frame = view.layer.bounds
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
        
        // Add corner brackets overlay
        addCornerOverlay()
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }
    
    func failed() {
        let ac = UIAlertController(title: "Scanning not supported", message: "Your device does not support scanning.", preferredStyle: .alert)
        ac.addAction(UIAlertAction(title: "OK", style: .default))
        present(ac, animated: true)
        captureSession = nil
    }
    
    func addCornerOverlay() {
        let overlayView = UIView()
        overlayView.translatesAutoresizingMaskIntoConstraints = false
        overlayView.backgroundColor = .clear
        view.addSubview(overlayView)
        
        NSLayoutConstraint.activate([
            overlayView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            overlayView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            overlayView.widthAnchor.constraint(equalToConstant: 250),
            overlayView.heightAnchor.constraint(equalToConstant: 150)
        ])
        
        let cornerLength: CGFloat = 30
        let cornerThickness: CGFloat = 4
        let cornerColor = UIColor.systemGreen
        
        // Top left
        addCornerLayer(to: overlayView, x: 0, y: 0, width: cornerLength, height: cornerThickness, color: cornerColor)
        addCornerLayer(to: overlayView, x: 0, y: 0, width: cornerThickness, height: cornerLength, color: cornerColor)
        
        // Top right
        addCornerLayer(to: overlayView, x: 250 - cornerLength, y: 0, width: cornerLength, height: cornerThickness, color: cornerColor)
        addCornerLayer(to: overlayView, x: 250 - cornerThickness, y: 0, width: cornerThickness, height: cornerLength, color: cornerColor)
        
        // Bottom left
        addCornerLayer(to: overlayView, x: 0, y: 150 - cornerThickness, width: cornerLength, height: cornerThickness, color: cornerColor)
        addCornerLayer(to: overlayView, x: 0, y: 150 - cornerLength, width: cornerThickness, height: cornerLength, color: cornerColor)
        
        // Bottom right
        addCornerLayer(to: overlayView, x: 250 - cornerLength, y: 150 - cornerThickness, width: cornerLength, height: cornerThickness, color: cornerColor)
        addCornerLayer(to: overlayView, x: 250 - cornerThickness, y: 150 - cornerLength, width: cornerThickness, height: cornerLength, color: cornerColor)
    }
    
    func addCornerLayer(to view: UIView, x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat, color: UIColor) {
        let layer = CALayer()
        layer.frame = CGRect(x: x, y: y, width: width, height: height)
        layer.backgroundColor = color.cgColor
        view.layer.addSublayer(layer)
    }
    
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first {
            guard let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject else { return }
            guard let stringValue = readableObject.stringValue else { return }
            
            AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
            onCodeScanned?(stringValue)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if captureSession?.isRunning == false {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.captureSession.startRunning()
            }
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        if captureSession?.isRunning == true {
            captureSession.stopRunning()
        }
    }
}

// MARK: - Quantity Input View

struct QuantityInputView: View {
    let item: Item
    let onConfirm: (Int) -> Void
    
    @State private var quantity = "1"
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("Item") {
                    Text(item.name)
                        .font(.headline)
                    Text("SKU: \(item.sku)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(item.category)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Section("Quantity") {
                    TextField("Quantity", text: $quantity)
                        .keyboardType(.numberPad)
                }
            }
            .navigationTitle("Add to Session")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        if let qty = Int(quantity), qty > 0 {
                            onConfirm(qty)
                            dismiss()
                        }
                    }
                }
            }
        }
    }
}

import AudioToolbox

#Preview {
    ScannerView(viewModel: InventoryViewModel())
}