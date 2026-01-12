// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.
// "@transistorsoft/capacitor-background-fetch": "file:../../capacitor-background-fetch"

import PackageDescription

let package = Package(
    name: "TransistorsoftCapacitorBackgroundFetch",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "TransistorsoftCapacitorBackgroundFetch",
            targets: ["BackgroundFetchPlugin"]
        )
    ],
    dependencies: [
         .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
         .package(url: "https://github.com/transistorsoft/transistor-background-fetch.git", from: "4.0.3")
    ],
    targets: [
        .target(
            name: "BackgroundFetchPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "TSBackgroundFetch", package: "transistor-background-fetch")
            ],
            path: "ios/Sources/BackgroundFetchPlugin",
        )
    ]
)

