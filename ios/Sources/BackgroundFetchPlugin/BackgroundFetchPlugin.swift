import Foundation
import UIKit
import Capacitor
import TSBackgroundFetch

@objc(BackgroundFetchPlugin)
public class BackgroundFetchPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "BackgroundFetchPlugin"
    public let jsName = "BackgroundFetch"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnCallback),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleTask", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finish", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise)
    ]

    private let BACKGROUND_FETCH_TAG = "BackgroundFetchPlugin"
    private let EVENT_FETCH = "fetch"
    private let PLUGIN_ID = "capacitor-background-fetch"


    private var configured = false

    // MARK: - Lifecycle

    @objc public override func load() {
        configured = false
    }

    // MARK: - Plugin Methods

    @objc func configure(_ call: CAPPluginCall) {
        let config = call.getObject("options") ?? [:]
        let fetchManager = TSBackgroundFetch.sharedInstance()

        fetchManager?.addListener(
            PLUGIN_ID,
            callback: createFetchCallback(),
            timeout: createFetchTimeoutCallback()
        )

        let delay = (config["minimumFetchInterval"] as? Double ?? 15) * 60

        fetchManager?.configure(delay) { [weak self] status in
            guard let self = self else { return }
            self.configured = true
            if status != .available {
                NSLog("- \(self.BACKGROUND_FETCH_TAG) failed to start, status: \(status.rawValue)")
                call.reject("Failed to start", nil, nil, ["status": status.rawValue])
            } else {
                call.resolve(["status": status.rawValue])
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        let fetchManager = TSBackgroundFetch.sharedInstance()
        fetchManager?.status { [weak self] status in
            guard let self = self else { return }
            if status == .available {
                fetchManager?.addListener(self.PLUGIN_ID, callback: self.createFetchCallback(), timeout: self.createFetchTimeoutCallback())
                if let error = fetchManager?.start(nil) {
                    let nsError = error as NSError
                    call.reject(error.localizedDescription, nil, nil, nsError.userInfo)
                } else {
                    call.resolve(["status": status.rawValue])
                }
            } else {
                NSLog("- \(self.PLUGIN_ID) failed to start, status: \(status.rawValue)")
                call.reject("\(status.rawValue)", nil, nil, [:])
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        let taskId = call.getString("taskId")
        let fetchManager = TSBackgroundFetch.sharedInstance()
        if taskId == nil {
            fetchManager?.removeListener(PLUGIN_ID)
        }
        fetchManager?.stop(taskId)
        call.resolve()
    }

    @objc func scheduleTask(_ call: CAPPluginCall) {
        let config = call.getObject("options") ?? [:]
        let taskId = config["taskId"] as? String ?? ""
        let delayMS = config["delay"] as? Double ?? 0
        let delay = delayMS / 1000
        let periodic = config["periodic"] as? Bool ?? false
        let requiresCharging = config["requiresCharging"] as? Bool ?? false
        let requiresNetwork = config["requiresNetworkConnectivity"] as? Bool ?? false

        let error = TSBackgroundFetch.sharedInstance()?.scheduleProcessingTask(
            withIdentifier: taskId,
            type: 0,
            delay: delay,
            periodic: periodic,
            requiresExternalPower: requiresCharging,
            requiresNetworkConnectivity: requiresNetwork,
            callback: createTaskCallback()
        )

        if let error = error {
            let nsError = error as NSError
            call.reject(error.localizedDescription, nil, nil, nsError.userInfo)
        } else {
            call.resolve()
        }
    }

    @objc func finish(_ call: CAPPluginCall) {
        let taskId = call.getString("taskId")
        TSBackgroundFetch.sharedInstance()?.finish(taskId)
        call.resolve()
    }

    @objc func status(_ call: CAPPluginCall) {
        TSBackgroundFetch.sharedInstance()?.status { status in
            call.resolve(["status": status.rawValue])
        }
    }

    // MARK: - Callback Creators

    private func createFetchCallback() -> (String?) -> Void {
        return { [weak self] taskId in
            guard let self = self, let taskId = taskId else { return }
            NSLog("- \(self.BACKGROUND_FETCH_TAG) Received fetch event \(taskId)")
            self.notifyListeners(self.EVENT_FETCH, data: [
                "taskId": taskId,
                "timeout": false
            ])
        }
    }

    private func createFetchTimeoutCallback() -> (String?) -> Void {
        return { [weak self] taskId in
            guard let self = self, let taskId = taskId else { return }
            self.notifyListeners(self.EVENT_FETCH, data: [
                "taskId": taskId,
                "timeout": true
            ])
        }
    }

    private func createTaskCallback() -> (String?, Bool) -> Void {
        return { [weak self] taskId, timeout in
            guard let self = self, let taskId = taskId else { return }
            NSLog("- \(self.BACKGROUND_FETCH_TAG) Received event \(taskId)")
            self.notifyListeners(self.EVENT_FETCH, data: [
                "taskId": taskId,
                "timeout": timeout
            ])
        }
    }

}




