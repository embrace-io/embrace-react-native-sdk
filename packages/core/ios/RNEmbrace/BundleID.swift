import Foundation
import EmbraceIO
import CryptoKit

private struct LastBundleComputation: Codable {
    private static let STORAGE_KEY = "EMBRACE_LAST_BUNDLE_COMPUTATION"
    var path: String
    var computedAt: Date?
    var id: String

    func store () {
        if let encoded = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(encoded, forKey: LastBundleComputation.STORAGE_KEY)
        }
    }

    static func fromStorage() -> LastBundleComputation {
        if let storedData = UserDefaults.standard.object(forKey: LastBundleComputation.STORAGE_KEY) as? Data,
           let loaded = try? JSONDecoder().decode(LastBundleComputation.self, from: storedData) {
            return loaded
        }

        return LastBundleComputation(path: "", computedAt: nil, id: "")
    }
}

enum ComputeBundleIDErrors: Error {
    case emptyPath
}

struct BundleID {
    var id: String
    var cached: Bool
}

func computeBundleID(path: String) throws -> BundleID {
    if path.isEmpty {
        throw ComputeBundleIDErrors.emptyPath
    }

    var last = LastBundleComputation.fromStorage()

    // Check if we can re-use our last computed bundle ID, this is true only if the path hasn't changed and
    // the file contents at that path haven't been modified since the last time we computed the ID
    // TODO in ios 5.x and Android implementation we are just returning last.id in this case without checking modified at...is that correct?
    if path == last.path {
        let attributes = try? FileManager.default.attributesOfItem(atPath: path)
        if let lastComputed = last.computedAt, let modifiedAt = attributes?[FileAttributeKey.modificationDate] as? Date,
           modifiedAt <= lastComputed {
            return BundleID(id: last.id, cached: true)
        }
    }

    let fileContents = try String(contentsOf: URL(fileURLWithPath: path))

    // https://stackoverflow.com/a/56578995
    let bundleID = Insecure.MD5.hash(data: Data(fileContents.utf8)).map {
        String(format: "%02hhx", $0)
    }.joined()

    last.computedAt = Date()
    last.path = path
    last.id = bundleID
    last.store()

    return BundleID(id: last.id, cached: false)
}
