// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.
// "@transistorsoft/capacitor-background-fetch": "file:../../capacitor-background-fetch"

import PackageDescription

let package = Package(
    name: "TransistorsoftCapacitorBackgroundFetch",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "TransistorsoftCapacitorBackgroundFetch",
            targets: ["BackgroundFetchPlugin"]
        )
    ],
    dependencies: [
         .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "BackgroundFetchPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                "TSBackgroundFetch"
            ],
            path: "ios/Sources/BackgroundFetchPlugin",
            resources: [
                .process("PrivacyInfo.xcprivacy")
            ]
        ),
        .binaryTarget(
            name: "TSBackgroundFetch",
            path: "ios/Frameworks/TSBackgroundFetch.xcframework"
        )
    ]
)

