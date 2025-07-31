require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'TransistorsoftCapacitorBackgroundFetch'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Sources/BackgroundFetchPlugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '12.0'
  s.dependency 'Capacitor'
  s.vendored_frameworks = ['ios/Frameworks/TSBackgroundFetch.xcframework']
  s.resource_bundles = {'TSBackgroundFetchPrivacy' => ['ios/Sources/BackgroundFetchPlugin/PrivacyInfo.xcprivacy']}
  s.static_framework = true
  s.swift_version = '5.1'
end
