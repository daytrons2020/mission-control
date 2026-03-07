// Package.swift
// swift-tools-version:5.7

import PackageDescription

let package = Package(
    name: "InventoryScanner",
    platforms: [
        .iOS(.v16)
    ],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0")
    ],
    targets: [
        .executableTarget(
            name: "InventoryScanner",
            dependencies: [
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestoreSwift", package: "firebase-ios-sdk")
            ]
        )
    ]
)